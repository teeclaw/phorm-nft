#!/usr/bin/env node
/**
 * Swap USDC → WETH on Base using Uniswap V3
 * Then unwrap WETH → ETH
 */

import { ethers } from 'ethers';
import { KmsSigner } from './kms-signer.mjs';

const USDC_BASE = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // 6 decimals
const WETH_BASE = '0x4200000000000000000000000000000000000006'; // 18 decimals
const UNISWAP_V3_ROUTER = '0x2626664c2603336E57B271c5C0b26F421741e481'; // Base Mainnet
const POOL_FEE = 3000; // 0.3%

const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
const signer = new KmsSigner(provider);

const ERC20_ABI = [
  'function balanceOf(address) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

const WETH_ABI = [
  'function withdraw(uint256) returns ()',
  'function balanceOf(address) view returns (uint256)',
];

const ROUTER_ABI = [
  'function exactInputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountIn, uint256 amountOutMinimum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountOut)',
];

async function main() {
  const amountUSDC = process.argv[2] || '5';
  const amountInWei = ethers.parseUnits(amountUSDC, 6); // USDC = 6 decimals
  const slippage = 0.02; // 2%

  const address = await signer.getAddress();
  console.log('🔄 USDC → ETH Swap on Base (Uniswap V3)');
  console.log('━'.repeat(50));
  console.log(`Wallet:  ${address}`);
  console.log(`Amount:  ${amountUSDC} USDC`);

  // Check USDC balance
  const usdcContract = new ethers.Contract(USDC_BASE, ERC20_ABI, provider);
  const balance = await usdcContract.balanceOf(address);
  console.log(`Balance: ${ethers.formatUnits(balance, 6)} USDC`);

  if (balance < amountInWei) {
    throw new Error('Insufficient USDC balance');
  }

  // Check initial ETH balance
  const initialETH = await provider.getBalance(address);
  console.log(`ETH:     ${ethers.formatEther(initialETH)} ETH\n`);

  // Check allowance and approve if needed
  const allowance = await usdcContract.allowance(address, UNISWAP_V3_ROUTER);
  if (allowance < amountInWei) {
    console.log('✍️  Approving Uniswap Router...');
    const approveTx = await usdcContract.connect(signer).approve(UNISWAP_V3_ROUTER, amountInWei);
    console.log(`Approval tx: ${approveTx.hash}`);
    await approveTx.wait();
    console.log('✅ Approval confirmed\n');
  } else {
    console.log('✅ Allowance sufficient\n');
  }

  // Estimate output (rough: 1 USDC ≈ 0.0003 ETH, adjust with slippage)
  // For production: fetch from pool or quoter
  const estimatedWETH = (BigInt(amountInWei) * BigInt(3) * BigInt(10 ** 14)) / BigInt(10 ** 6); // rough estimate
  const minWETH = (estimatedWETH * BigInt(Math.floor((1 - slippage) * 100))) / BigInt(100);

  console.log(`Expected: ~${ethers.formatEther(estimatedWETH)} WETH`);
  console.log(`Min out:  ${ethers.formatEther(minWETH)} WETH (2% slippage)\n`);

  // Execute swap
  console.log('🚀 Swapping USDC → WETH...');
  const router = new ethers.Contract(UNISWAP_V3_ROUTER, ROUTER_ABI, signer);

  const swapParams = {
    tokenIn: USDC_BASE,
    tokenOut: WETH_BASE,
    fee: POOL_FEE,
    recipient: address,
    amountIn: amountInWei,
    amountOutMinimum: minWETH,
    sqrtPriceLimitX96: 0, // no price limit
  };

  const swapTx = await router.exactInputSingle(swapParams);
  console.log(`Swap tx: ${swapTx.hash}`);
  const swapReceipt = await swapTx.wait();
  console.log(`✅ Swap confirmed in block ${swapReceipt.blockNumber}\n`);

  // Check WETH balance
  const wethContract = new ethers.Contract(WETH_BASE, WETH_ABI, provider);
  const wethBalance = await wethContract.balanceOf(address);
  console.log(`WETH received: ${ethers.formatEther(wethBalance)} WETH`);

  // Unwrap WETH → ETH
  if (wethBalance > 0n) {
    console.log('\n🔓 Unwrapping WETH → ETH...');
    const unwrapTx = await wethContract.connect(signer).withdraw(wethBalance);
    console.log(`Unwrap tx: ${unwrapTx.hash}`);
    await unwrapTx.wait();
    console.log('✅ Unwrap confirmed\n');
  }

  // Final balance
  const finalETH = await provider.getBalance(address);
  const gained = finalETH - initialETH;
  console.log('━'.repeat(50));
  console.log(`Initial ETH: ${ethers.formatEther(initialETH)} ETH`);
  console.log(`Final ETH:   ${ethers.formatEther(finalETH)} ETH`);
  console.log(`Gained:      ${ethers.formatEther(gained)} ETH`);
  console.log(`\nSwap: https://basescan.org/tx/${swapTx.hash}`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  if (err.data) console.error('Data:', err.data);
  process.exit(1);
});
