// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {SchemaResolver} from "@ethereum-attestation-service/eas-contracts/contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @title CryptoClarityResolver
/// @notice EAS resolver for the CryptoClarity Manifesto.
///         ERC-8004 registered agents sign free. Everyone else pays $1 USDC.
/// @dev Uses Ownable2Step for safe ownership transfer, ReentrancyGuard for
///      external call safety, and Pausable for emergency stop.
contract CryptoClarityResolver is SchemaResolver, Ownable2Step, ReentrancyGuard, Pausable {

    /// @notice USDC on Base (6 decimals)
    IERC20 public immutable usdc;

    /// @notice EAS contract address (for reference)
    IEAS public immutable easContract;

    /// @notice Signing fee in USDC smallest unit (default: 1_000_000 = $1)
    uint256 public signingFee;

    /// @notice Maximum allowed signing fee ($100 USDC) to prevent owner error
    uint256 public constant MAX_FEE = 100_000_000;

    /// @notice Maximum number of trusted registries to bound gas costs
    uint256 public constant MAX_REGISTRIES = 20;

    /// @notice Treasury (Safe wallet) that receives fees
    address public treasury;

    /// @notice Trusted ERC-8004 registries (agents here sign free)
    address[] public trustedRegistries;

    /// @notice Quick lookup for trusted registries
    mapping(address => bool) public isRegistryTrusted;

    /// @notice Track which addresses have already signed (one signature per address)
    mapping(address => bool) public hasSigned;

    event RegistryAdded(address indexed registry);
    event RegistryRemoved(address indexed registry);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event ManifestoSigned(address indexed signer, bool verified, uint256 feePaid);

    error AlreadySigned();
    error PaymentFailed();
    error ZeroAddress();
    error RegistryAlreadyTrusted();
    error RegistryNotTrusted();
    error FeeTooHigh();
    error TooManyRegistries();
    error InvalidAttestation();

    constructor(
        IEAS _eas,
        IERC20 _usdc,
        address _treasury,
        address _owner,
        address[] memory _registries
    ) SchemaResolver(_eas) Ownable(_owner) {
        if (_treasury == address(0)) revert ZeroAddress();
        if (address(_usdc) == address(0)) revert ZeroAddress();
        if (_registries.length > MAX_REGISTRIES) revert TooManyRegistries();

        easContract = _eas;
        usdc = _usdc;
        treasury = _treasury;
        signingFee = 1_000_000; // $1 USDC

        for (uint256 i = 0; i < _registries.length; i++) {
            _addRegistry(_registries[i]);
        }
    }

    /// @notice Called by EAS during attestation creation
    /// @dev nonReentrant guards against callback attacks from malicious ERC-721
    ///      or ERC-20 contracts. whenNotPaused allows emergency stop.
    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal override nonReentrant returns (bool) {
        // Contract must not be paused
        if (paused()) return false;

        address signer = attestation.attester;

        // Reject zero address and contract attesters without code
        if (signer == address(0)) revert InvalidAttestation();

        // One signature per address
        if (hasSigned[signer]) revert AlreadySigned();

        // Check if signer holds an agent in any trusted registry
        bool verified = _isRegisteredAgent(signer);

        if (!verified) {
            // Pull USDC from signer to treasury
            // Using SafeERC20 pattern: check return value
            bool success = usdc.transferFrom(signer, treasury, signingFee);
            if (!success) revert PaymentFailed();
        }

        // Mark as signed AFTER all external calls (CEI pattern)
        hasSigned[signer] = true;

        emit ManifestoSigned(signer, verified, verified ? 0 : signingFee);
        return true;
    }

    /// @notice Revocations are not allowed (manifesto signatures are irrevocable)
    function onRevoke(
        Attestation calldata, /*attestation*/
        uint256 /*value*/
    ) internal pure override returns (bool) {
        return false;
    }

    // --- View functions ---

    /// @notice Check if an address is a registered agent in any trusted registry
    function isRegisteredAgent(address account) external view returns (bool) {
        return _isRegisteredAgent(account);
    }

    /// @notice Get all trusted registries
    function getTrustedRegistries() external view returns (address[] memory) {
        return trustedRegistries;
    }

    /// @notice Get the number of trusted registries
    function registryCount() external view returns (uint256) {
        return trustedRegistries.length;
    }

    // --- Owner functions ---

    /// @notice Pause the contract (emergency stop)
    function pause() external onlyOwner {
        _pause();
    }

    /// @notice Unpause the contract
    function unpause() external onlyOwner {
        _unpause();
    }

    /// @notice Add a trusted ERC-8004 registry
    function addRegistry(address registry) external onlyOwner {
        if (trustedRegistries.length >= MAX_REGISTRIES) revert TooManyRegistries();
        _addRegistry(registry);
    }

    /// @notice Remove a trusted registry
    function removeRegistry(address registry) external onlyOwner {
        if (!isRegistryTrusted[registry]) revert RegistryNotTrusted();
        isRegistryTrusted[registry] = false;

        uint256 len = trustedRegistries.length;
        for (uint256 i = 0; i < len; i++) {
            if (trustedRegistries[i] == registry) {
                trustedRegistries[i] = trustedRegistries[len - 1];
                trustedRegistries.pop();
                break;
            }
        }

        emit RegistryRemoved(registry);
    }

    /// @notice Update treasury address
    function setTreasury(address _treasury) external onlyOwner {
        if (_treasury == address(0)) revert ZeroAddress();
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }

    /// @notice Update signing fee (capped at MAX_FEE to prevent owner error)
    function setSigningFee(uint256 _fee) external onlyOwner {
        if (_fee > MAX_FEE) revert FeeTooHigh();
        uint256 old = signingFee;
        signingFee = _fee;
        emit FeeUpdated(old, _fee);
    }

    // --- Internal ---

    /// @dev Checks all trusted registries. Uses try/catch so a broken registry
    ///      can't brick the entire resolver. Gas bounded by MAX_REGISTRIES.
    function _isRegisteredAgent(address account) internal view returns (bool) {
        uint256 len = trustedRegistries.length;
        for (uint256 i = 0; i < len; i++) {
            try IERC721(trustedRegistries[i]).balanceOf(account) returns (uint256 balance) {
                if (balance > 0) return true;
            } catch {
                // Registry call failed, skip
            }
        }
        return false;
    }

    function _addRegistry(address registry) internal {
        if (registry == address(0)) revert ZeroAddress();
        if (isRegistryTrusted[registry]) revert RegistryAlreadyTrusted();

        trustedRegistries.push(registry);
        isRegistryTrusted[registry] = true;
        emit RegistryAdded(registry);
    }

    /// @notice Reject any ETH sent directly to this contract
    receive() external payable {
        revert();
    }
}
