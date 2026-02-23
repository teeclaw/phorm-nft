// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/**
 * @title CryptoClarityResolver
 * @notice EAS resolver for the CryptoClarity Manifesto.
 *         ERC-8004 registered agents sign free. Everyone else pays $1 USDC.
 * @custom:security-contact https://github.com/teeclaw
 */

import {SchemaResolver} from "eas-contracts/contracts/resolver/SchemaResolver.sol";
import {IEAS, Attestation} from "eas-contracts/contracts/IEAS.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";
import {ReentrancyGuardTransient} from "@openzeppelin/contracts/utils/ReentrancyGuardTransient.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

contract CryptoClarityResolver is SchemaResolver, Ownable2Step, ReentrancyGuardTransient, Pausable {

    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    /// @notice USDC token contract (6 decimals)
    IERC20 public immutable USDC;

    /// @notice EAS contract reference
    IEAS public immutable EAS_CONTRACT;

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

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event RegistryAdded(address indexed registry);
    event RegistryRemoved(address indexed registry);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeeUpdated(uint256 oldFee, uint256 newFee);
    event ManifestoSigned(address indexed signer, bool verified, uint256 feePaid);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error CryptoClarityResolver__AlreadySigned();
    error CryptoClarityResolver__PaymentFailed();
    error CryptoClarityResolver__ZeroAddress();
    error CryptoClarityResolver__RegistryAlreadyTrusted();
    error CryptoClarityResolver__RegistryNotTrusted();
    error CryptoClarityResolver__FeeTooHigh();
    error CryptoClarityResolver__TooManyRegistries();
    error CryptoClarityResolver__InvalidAttestation();
    error CryptoClarityResolver__ContractPaused();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    constructor(
        IEAS _eas,
        IERC20 _usdc,
        address _treasury,
        address _owner,
        address[] memory _registries
    ) SchemaResolver(_eas) Ownable(_owner) {
        if (_treasury == address(0)) revert CryptoClarityResolver__ZeroAddress();
        if (address(_usdc) == address(0)) revert CryptoClarityResolver__ZeroAddress();
        if (_registries.length > MAX_REGISTRIES) revert CryptoClarityResolver__TooManyRegistries();

        EAS_CONTRACT = _eas;
        USDC = _usdc;
        treasury = _treasury;
        signingFee = 1_000_000;

        for (uint256 i; i < _registries.length; ++i) {
            _addRegistry(_registries[i]);
        }
    }

    /*//////////////////////////////////////////////////////////////
                    USER-FACING STATE-CHANGING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Called by EAS during attestation creation
    /// @dev nonReentrant guards against callback attacks from malicious ERC-721
    ///      or ERC-20 contracts. Checks pause state manually since onAttest
    ///      cannot use modifiers (internal override).
    function onAttest(
        Attestation calldata attestation,
        uint256 /*value*/
    ) internal override nonReentrant returns (bool) {
        if (paused()) revert CryptoClarityResolver__ContractPaused();

        address signer = attestation.attester;
        if (signer == address(0)) revert CryptoClarityResolver__InvalidAttestation();
        if (hasSigned[signer]) revert CryptoClarityResolver__AlreadySigned();

        bool verified = _isRegisteredAgent(signer);

        if (!verified) {
            bool success = USDC.transferFrom(signer, treasury, signingFee);
            if (!success) revert CryptoClarityResolver__PaymentFailed();
        }

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

    /*//////////////////////////////////////////////////////////////
                      USER-FACING READ-ONLY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

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

    /*//////////////////////////////////////////////////////////////
                          ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

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
        if (trustedRegistries.length >= MAX_REGISTRIES) revert CryptoClarityResolver__TooManyRegistries();
        _addRegistry(registry);
    }

    /// @notice Remove a trusted registry
    function removeRegistry(address registry) external onlyOwner {
        if (!isRegistryTrusted[registry]) revert CryptoClarityResolver__RegistryNotTrusted();
        isRegistryTrusted[registry] = false;

        uint256 len = trustedRegistries.length;
        for (uint256 i; i < len; ++i) {
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
        if (_treasury == address(0)) revert CryptoClarityResolver__ZeroAddress();
        address old = treasury;
        treasury = _treasury;
        emit TreasuryUpdated(old, _treasury);
    }

    /// @notice Update signing fee (capped at MAX_FEE to prevent owner error)
    function setSigningFee(uint256 _fee) external onlyOwner {
        if (_fee > MAX_FEE) revert CryptoClarityResolver__FeeTooHigh();
        uint256 old = signingFee;
        signingFee = _fee;
        emit FeeUpdated(old, _fee);
    }

    /*//////////////////////////////////////////////////////////////
                      INTERNAL STATE-CHANGING FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function _addRegistry(address registry) internal {
        if (registry == address(0)) revert CryptoClarityResolver__ZeroAddress();
        if (isRegistryTrusted[registry]) revert CryptoClarityResolver__RegistryAlreadyTrusted();

        trustedRegistries.push(registry);
        isRegistryTrusted[registry] = true;
        emit RegistryAdded(registry);
    }

    /*//////////////////////////////////////////////////////////////
                      INTERNAL READ-ONLY FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @dev Checks all trusted registries. Uses try/catch so a broken registry
    ///      can't brick the entire resolver. Gas bounded by MAX_REGISTRIES.
    function _isRegisteredAgent(address account) internal view returns (bool) {
        uint256 len = trustedRegistries.length;
        for (uint256 i; i < len; ++i) {
            try IERC721(trustedRegistries[i]).balanceOf(account) returns (uint256 balance) {
                if (balance > 0) return true;
            } catch {
                // Registry call failed, skip
            }
        }
        return false;
    }

    /// @dev No receive() needed. Base SchemaResolver already reverts ETH
    ///      when isPayable() returns false (the default).
}
