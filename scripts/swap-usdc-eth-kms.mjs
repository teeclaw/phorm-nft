#!/usr/bin/env node
/**
 * Swap USDC → ETH on Base using KMS signer
 * Uses 1inch API for best execution
 */

import { ethers } from 'ethers';
import { KmsSigner } from './kms-signer.mjs';

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // 6 decimals
const WETH_BASE = '0x4200000000000000000000000000000000000006';
const CHAIN_ID = 8453; // Base
const ONE_INCH_API = `https://api.1inch.dev/swap/v6.0/${CHAIN_ID}`;

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const signer = new KmsSigner(provider);

async function get1inchQuote(fromToken, toToken, amount) {
  const params = new URLSearchParams({
    src: fromToken,
    dst: toToken,
    amount: amount.toString(),
  });

  const url = `${ONE_INCH_API}/quote?${params}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.ONEINCH_API_KEY || ''}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`1inch quote failed: ${res.status} ${err}`);
  }

  return res.json();
}

async function get1inchSwap(fromToken, toToken, amount, fromAddress, slippage = 1) {
  const params = new URLSearchParams({
    src: fromToken,
    dst: toToken,
    amount: amount.toString(),
    from: fromAddress,
    slippage: slippage.toString(),
    disableEstimate: 'true',
  });

  const url = `${ONE_INCH_API}/swap?${params}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${process.env.ONEINCH_API_KEY || ''}`,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`1inch swap failed: ${res.status} ${err}`);
  }

  return res.json();
}

async function approveToken(tokenAddress, spenderAddress, amount) {
  const abi = ['function approve(address spender, uint256 amount) returns (bool)'];
  const contract = new ethers.Contract(tokenAddress, abi, signer);

  console.log(`Approving ${spenderAddress} to spend ${amount}...`);
  const tx = await contract.approve(spenderAddress, amount);
  console.log(`Approval tx: ${tx.hash}`);
  await tx.wait();
  console.log('✅ Approval confirmed');
  return tx.hash;
}

async function checkAllowance(tokenAddress, ownerAddress, spenderAddress) {
  const abi = ['function allowance(address owner, address spender) view returns (uint256)'];
  const contract = new ethers.Contract(tokenAddress, abi, provider);
  return contract.allowance(ownerAddress, spenderAddress);
}

async function main() {
  const amountUSDC = process.argv[2] || '5';
  const amountInWei = ethers.parseUnits(amountUSDC, 6); // USDC has 6 decimals

  const address = await signer.getAddress();
  console.log('🔄 USDC → ETH Swap on Base');
  console.log('━'.repeat(50));
  console.log(`Wallet:  ${address}`);
  console.log(`Amount:  ${amountUSDC} USDC`);

  // Check balance
  const usdcAbi = ['function balanceOf(address) view returns (uint256)'];
  const usdcContract = new ethers.Contract(USDC_BASE, usdcAbi, provider);
  const balance = await usdcContract.balanceOf(address);
  console.log(`Balance: ${ethers.formatUnits(balance, 6)} USDC`);

  if (balance < amountInWei) {
    throw new Error('Insufficient USDC balance');
  }

  // Get quote
  console.log('\n📊 Getting quote from 1inch...');
  const quote = await get1inchQuote(USDC_BASE, WETH_BASE, amountInWei);
  const estimatedETH = ethers.formatEther(quote.dstAmount);
  console.log(`Expected output: ${estimatedETH} ETH`);

  // Get swap data
  console.log('\n🔧 Building swap transaction...');
  const swap = await get1inchSwap(USDC_BASE, WETH_BASE, amountInWei, address, 1);

  // Check allowance and approve if needed
  const allowance = await checkAllowance(USDC_BASE, address, swap.tx.to);
  if (allowance < amountInWei) {
    console.log('\n✍️  Approval needed...');
    await approveToken(USDC_BASE, swap.tx.to, amountInWei);
  } else {
    console.log('\n✅ Allowance sufficient');
  }

  // Execute swap
  console.log('\n🚀 Executing swap...');
  const tx = await signer.sendTransaction({
    to: swap.tx.to,
    data: swap.tx.data,
    value: swap.tx.value,
    gasLimit: swap.tx.gas,
  });

  console.log(`Swap tx: ${tx.hash}`);
  console.log('⏳ Waiting for confirmation...');

  const receipt = await tx.wait();
  console.log(`✅ Swap confirmed in block ${receipt.blockNumber}`);

  // Check new ETH balance
  const ethBalance = await provider.getBalance(address);
  console.log(`\nNew ETH balance: ${ethers.formatEther(ethBalance)} ETH`);
  console.log(`\nTx: https://basescan.org/tx/${tx.hash}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
