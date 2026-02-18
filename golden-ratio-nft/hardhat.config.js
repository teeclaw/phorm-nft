require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY    = process.env.DEPLOYER_PRIVATE_KEY || "0x" + "0".repeat(64);
const BASE_RPC       = process.env.BASE_RPC       || "https://mainnet.base.org";
const SEPOLIA_RPC    = process.env.BASE_SEPOLIA_RPC || "https://sepolia.base.org";
const BASESCAN_KEY   = process.env.BASESCAN_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: false,
    },
  },
  networks: {
    hardhat: {
      chainId: 8453,
    },
    baseSepolia: {
      url: SEPOLIA_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 84532,
    },
    base: {
      url: BASE_RPC,
      accounts: [PRIVATE_KEY],
      chainId: 8453,
      gasPrice: "auto",
    },
  },
  etherscan: {
    apiKey: {
      base:        BASESCAN_KEY,
      baseSepolia: BASESCAN_KEY,
    },
    customChains: [
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL:     "https://api.basescan.org/api",
          browserURL: "https://basescan.org",
        },
      },
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL:     "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
};
