// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import {CryptoClarityResolver} from "../src/CryptoClarityResolver.sol";
import {IEAS} from "eas-contracts/contracts/IEAS.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deploy is Script {
    // Base mainnet addresses
    IEAS constant EAS = IEAS(0x4200000000000000000000000000000000000021);
    IERC20 constant USDC = IERC20(0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913);

    // Treasury (Safe wallet)
    address constant TREASURY = 0xFdF53De20f46bAE2Fa6414e6F25EF1654E68Acd0;

    // Owner (cold wallet)
    address constant OWNER = 0x168D8b4f50BB3aA67D05a6937B643004257118ED;

    // Trusted ERC-8004 registries on Base
    address constant REGISTRY_MAIN = 0x8004A169FB4a3325136EB29fA0ceB6D2e539a432;
    address constant REGISTRY_ZSCORE = 0xFfE9395fa761e52DBC077a2e7Fd84f77e8abCc41;

    function run() external {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");

        vm.startBroadcast(deployerKey);

        address[] memory registries = new address[](2);
        registries[0] = REGISTRY_MAIN;
        registries[1] = REGISTRY_ZSCORE;

        CryptoClarityResolver resolver = new CryptoClarityResolver(
            EAS,
            USDC,
            TREASURY,
            OWNER,
            registries
        );

        console.log("CryptoClarityResolver deployed at:", address(resolver));
        console.log("Owner:", OWNER);
        console.log("Treasury:", TREASURY);
        console.log("Registries:", registries.length);

        vm.stopBroadcast();
    }
}
