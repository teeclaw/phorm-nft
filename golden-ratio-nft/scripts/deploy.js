const { ethers, run, network } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("=".repeat(50));
  console.log("Golden Ratio NFT — Deployer:", deployer.address);
  console.log("Network:", network.name);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
  console.log("=".repeat(50));

  // Deploy
  console.log("\nDeploying GoldenRatio...");
  const GoldenRatio = await ethers.getContractFactory("GoldenRatio");
  const contract = await GoldenRatio.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ GoldenRatio deployed to:", address);
  console.log("   Max Supply:", await contract.MAX_SUPPLY(), "tokens");
  console.log("   Mint Price:", ethers.formatEther(await contract.MINT_PRICE()), "ETH");

  // Wait for confirmations before verify
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\nWaiting 5 confirmations for BaseScan indexing...");
    await contract.deploymentTransaction().wait(5);

    console.log("Verifying on BaseScan...");
    try {
      await run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Verified on BaseScan:", `https://basescan.org/address/${address}`);
    } catch (e) {
      if (e.message.includes("Already Verified")) {
        console.log("Already verified.");
      } else {
        console.error("Verification failed:", e.message);
      }
    }
  }

  console.log("\n=".repeat(50));
  console.log("DEPLOYMENT SUMMARY");
  console.log("=".repeat(50));
  console.log("Contract: ", address);
  console.log("Network:  ", network.name, `(chainId ${network.config.chainId})`);
  console.log("BaseScan: ", `https://basescan.org/address/${address}`);
  console.log("OpenSea:  ", `https://opensea.io/assets/base/${address}`);
  console.log("\nUpdate CONTRACT_ADDRESS in frontend/index.html before deploying the site.");
  console.log("=".repeat(50));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
