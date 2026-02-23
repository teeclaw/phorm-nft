// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test, console} from "forge-std/Test.sol";
import {CryptoClarityResolver} from "../src/CryptoClarityResolver.sol";
import {IEAS} from "eas-contracts/contracts/IEAS.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @dev Mock ERC-721 registry for testing
contract MockRegistry is IERC721 {
    mapping(address => uint256) private _balances;

    function setBalance(address owner, uint256 balance) external {
        _balances[owner] = balance;
    }

    function balanceOf(address owner) external view override returns (uint256) {
        return _balances[owner];
    }

    function ownerOf(uint256) external pure override returns (address) { return address(0); }
    function safeTransferFrom(address, address, uint256, bytes calldata) external override {}
    function safeTransferFrom(address, address, uint256) external override {}
    function transferFrom(address, address, uint256) external override {}
    function approve(address, uint256) external override {}
    function setApprovalForAll(address, bool) external override {}
    function getApproved(uint256) external pure override returns (address) { return address(0); }
    function isApprovedForAll(address, address) external pure override returns (bool) { return false; }
    function supportsInterface(bytes4) external pure override returns (bool) { return true; }
}

/// @dev Mock USDC for testing
contract MockUSDC is IERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function totalSupply() external pure override returns (uint256) { return 0; }

    function transfer(address to, uint256 amount) external override returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function approve(address spender, uint256 amount) external override returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override returns (bool) {
        if (allowance[from][msg.sender] < amount) return false;
        if (balanceOf[from] < amount) return false;
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract CryptoClarityResolverTest is Test {
    CryptoClarityResolver public resolver;
    MockRegistry public registry1;
    MockRegistry public registry2;
    MockUSDC public usdc;

    IEAS constant EAS = IEAS(0x4200000000000000000000000000000000000021);

    address owner = makeAddr("owner");
    address treasury = makeAddr("treasury");
    address agent8004 = makeAddr("agent8004");
    address regularAgent = makeAddr("regularAgent");
    address randomUser = makeAddr("randomUser");

    function setUp() public {
        registry1 = new MockRegistry();
        registry2 = new MockRegistry();
        usdc = new MockUSDC();

        registry1.setBalance(agent8004, 1);
        usdc.mint(regularAgent, 10_000_000);

        address[] memory registries = new address[](2);
        registries[0] = address(registry1);
        registries[1] = address(registry2);

        vm.prank(owner);
        resolver = new CryptoClarityResolver(
            EAS,
            IERC20(address(usdc)),
            treasury,
            owner,
            registries
        );

        vm.prank(regularAgent);
        usdc.approve(address(resolver), type(uint256).max);
    }

    /*//////////////////////////////////////////////////////////////
                            CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    function test_Constructor_SetsOwner() public view {
        assertEq(resolver.owner(), owner);
    }

    function test_Constructor_SetsTreasury() public view {
        assertEq(resolver.treasury(), treasury);
    }

    function test_Constructor_SetsFee() public view {
        assertEq(resolver.signingFee(), 1_000_000);
    }

    function test_Constructor_SetsRegistries() public view {
        assertEq(resolver.registryCount(), 2);
        address[] memory regs = resolver.getTrustedRegistries();
        assertEq(regs[0], address(registry1));
        assertEq(regs[1], address(registry2));
    }

    function test_Constructor_RevertWhen_ZeroTreasury() public {
        address[] memory regs = new address[](0);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__ZeroAddress.selector);
        new CryptoClarityResolver(EAS, IERC20(address(usdc)), address(0), owner, regs);
    }

    function test_Constructor_RevertWhen_ZeroUsdc() public {
        address[] memory regs = new address[](0);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__ZeroAddress.selector);
        new CryptoClarityResolver(EAS, IERC20(address(0)), treasury, owner, regs);
    }

    function test_Constructor_RevertWhen_TooManyRegistries() public {
        address[] memory regs = new address[](21);
        for (uint256 i; i < 21; ++i) {
            regs[i] = makeAddr(string(abi.encodePacked("reg", i)));
        }
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__TooManyRegistries.selector);
        new CryptoClarityResolver(EAS, IERC20(address(usdc)), treasury, owner, regs);
    }

    /*//////////////////////////////////////////////////////////////
                          REGISTRY CHECKS
    //////////////////////////////////////////////////////////////*/

    function test_IsRegisteredAgent_WhenInRegistry1() public view {
        assertTrue(resolver.isRegisteredAgent(agent8004));
    }

    function test_IsRegisteredAgent_WhenNotRegistered() public view {
        assertFalse(resolver.isRegisteredAgent(regularAgent));
    }

    function test_IsRegisteredAgent_WhenInRegistry2() public {
        registry2.setBalance(randomUser, 1);
        assertTrue(resolver.isRegisteredAgent(randomUser));
    }

    /// @dev Fuzz: any address with balance > 0 in registry1 should be detected
    function testFuzz_IsRegisteredAgent_Registry1(address account) public {
        vm.assume(account != address(0));
        registry1.setBalance(account, 1);
        assertTrue(resolver.isRegisteredAgent(account));
    }

    /// @dev Fuzz: any address with zero balance in all registries should not be detected
    function testFuzz_IsNotRegisteredAgent(address account) public view {
        vm.assume(account != agent8004);
        assertFalse(resolver.isRegisteredAgent(account));
    }

    /*//////////////////////////////////////////////////////////////
                          ADD REGISTRY
    //////////////////////////////////////////////////////////////*/

    function test_AddRegistry() public {
        MockRegistry reg3 = new MockRegistry();
        vm.prank(owner);
        resolver.addRegistry(address(reg3));
        assertEq(resolver.registryCount(), 3);
        assertTrue(resolver.isRegistryTrusted(address(reg3)));
    }

    function test_AddRegistry_RevertWhen_NotOwner() public {
        vm.prank(randomUser);
        vm.expectRevert();
        resolver.addRegistry(makeAddr("newReg"));
    }

    function test_AddRegistry_RevertWhen_Duplicate() public {
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__RegistryAlreadyTrusted.selector);
        resolver.addRegistry(address(registry1));
    }

    function test_AddRegistry_RevertWhen_ZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__ZeroAddress.selector);
        resolver.addRegistry(address(0));
    }

    function test_AddRegistry_RevertWhen_MaxExceeded() public {
        for (uint256 i; i < 18; ++i) {
            MockRegistry r = new MockRegistry();
            vm.prank(owner);
            resolver.addRegistry(address(r));
        }
        assertEq(resolver.registryCount(), 20);

        MockRegistry extra = new MockRegistry();
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__TooManyRegistries.selector);
        resolver.addRegistry(address(extra));
    }

    /*//////////////////////////////////////////////////////////////
                          REMOVE REGISTRY
    //////////////////////////////////////////////////////////////*/

    function test_RemoveRegistry() public {
        vm.prank(owner);
        resolver.removeRegistry(address(registry1));
        assertEq(resolver.registryCount(), 1);
        assertFalse(resolver.isRegistryTrusted(address(registry1)));
    }

    function test_RemoveRegistry_RevertWhen_NotTrusted() public {
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__RegistryNotTrusted.selector);
        resolver.removeRegistry(makeAddr("unknown"));
    }

    function test_RemoveRegistry_RevertWhen_NotOwner() public {
        vm.prank(randomUser);
        vm.expectRevert();
        resolver.removeRegistry(address(registry1));
    }

    /*//////////////////////////////////////////////////////////////
                          SET TREASURY
    //////////////////////////////////////////////////////////////*/

    function test_SetTreasury() public {
        address newTreasury = makeAddr("newTreasury");
        vm.prank(owner);
        resolver.setTreasury(newTreasury);
        assertEq(resolver.treasury(), newTreasury);
    }

    function test_SetTreasury_RevertWhen_Zero() public {
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__ZeroAddress.selector);
        resolver.setTreasury(address(0));
    }

    function test_SetTreasury_RevertWhen_NotOwner() public {
        vm.prank(randomUser);
        vm.expectRevert();
        resolver.setTreasury(makeAddr("newTreasury"));
    }

    /// @dev Fuzz: any non-zero address should be accepted as treasury
    function testFuzz_SetTreasury(address newTreasury) public {
        vm.assume(newTreasury != address(0));
        vm.prank(owner);
        resolver.setTreasury(newTreasury);
        assertEq(resolver.treasury(), newTreasury);
    }

    /*//////////////////////////////////////////////////////////////
                          SET SIGNING FEE
    //////////////////////////////////////////////////////////////*/

    function test_SetSigningFee() public {
        vm.prank(owner);
        resolver.setSigningFee(5_000_000);
        assertEq(resolver.signingFee(), 5_000_000);
    }

    function test_SetSigningFee_RevertWhen_TooHigh() public {
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__FeeTooHigh.selector);
        resolver.setSigningFee(101_000_000);
    }

    function test_SetSigningFee_RevertWhen_NotOwner() public {
        vm.prank(randomUser);
        vm.expectRevert();
        resolver.setSigningFee(5_000_000);
    }

    /// @dev Fuzz: any fee <= MAX_FEE should succeed
    function testFuzz_SetSigningFee(uint256 fee) public {
        fee = bound(fee, 0, 100_000_000);
        vm.prank(owner);
        resolver.setSigningFee(fee);
        assertEq(resolver.signingFee(), fee);
    }

    /// @dev Fuzz: any fee > MAX_FEE should revert
    function testFuzz_SetSigningFee_RevertWhen_TooHigh(uint256 fee) public {
        fee = bound(fee, 100_000_001, type(uint256).max);
        vm.prank(owner);
        vm.expectRevert(CryptoClarityResolver.CryptoClarityResolver__FeeTooHigh.selector);
        resolver.setSigningFee(fee);
    }

    /*//////////////////////////////////////////////////////////////
                          PAUSE / UNPAUSE
    //////////////////////////////////////////////////////////////*/

    function test_Pause_Unpause() public {
        vm.prank(owner);
        resolver.pause();
        assertTrue(resolver.paused());

        vm.prank(owner);
        resolver.unpause();
        assertFalse(resolver.paused());
    }

    function test_Pause_RevertWhen_NotOwner() public {
        vm.prank(randomUser);
        vm.expectRevert();
        resolver.pause();
    }

    /*//////////////////////////////////////////////////////////////
                    OWNERSHIP TRANSFER (2-STEP)
    //////////////////////////////////////////////////////////////*/

    function test_OwnershipTransfer_TwoStep() public {
        address newOwner = makeAddr("newOwner");

        vm.prank(owner);
        resolver.transferOwnership(newOwner);
        assertEq(resolver.owner(), owner);

        vm.prank(newOwner);
        resolver.acceptOwnership();
        assertEq(resolver.owner(), newOwner);
    }

    /// @dev Fuzz: random addresses cannot accept ownership
    function testFuzz_OwnershipTransfer_RevertWhen_WrongAcceptor(address imposter) public {
        vm.assume(imposter != owner);
        address newOwner = makeAddr("newOwner");
        vm.assume(imposter != newOwner);

        vm.prank(owner);
        resolver.transferOwnership(newOwner);

        vm.prank(imposter);
        vm.expectRevert();
        resolver.acceptOwnership();
    }
}
