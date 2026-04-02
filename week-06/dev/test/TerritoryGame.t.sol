// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../src/TerritoryGame.sol";

contract TerritoryGameTest is Test {
    TerritoryGame public game;
    address public alice;
    address public bob;
    address public charlie;

    function setUp() public {
        game = new TerritoryGame();
        alice = makeAddr("alice");
        bob = makeAddr("bob");
        charlie = makeAddr("charlie");
        vm.deal(alice, 10 ether);
        vm.deal(bob, 10 ether);
        vm.deal(charlie, 10 ether);
    }

    // === Single cell claim tests ===

    function test_ClaimEmptyCell() public {
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);

        (address owner, uint256 price) = game.getCell(0);
        assertEq(owner, alice);
        assertEq(price, 0.001 ether);
        assertEq(game.playerCellCount(alice), 1);
    }

    function test_ClaimEmptyCell_InsufficientPayment() public {
        vm.prank(alice);
        vm.expectRevert("Below base price");
        game.claimCell{value: 0.0005 ether}(0);
    }

    function test_ClaimEmptyCell_Overpay() public {
        vm.prank(alice);
        game.claimCell{value: 0.01 ether}(0);

        (address owner, uint256 price) = game.getCell(0);
        assertEq(owner, alice);
        assertEq(price, 0.01 ether);
    }

    function test_TakeoverCell() public {
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);

        vm.prank(bob);
        game.claimCell{value: 0.002 ether}(0);

        (address owner, uint256 price) = game.getCell(0);
        assertEq(owner, bob);
        assertEq(price, 0.002 ether);
        assertEq(game.playerCellCount(alice), 0);
        assertEq(game.playerCellCount(bob), 1);
    }

    function test_TakeoverCell_InsufficientPayment() public {
        vm.prank(alice);
        game.claimCell{value: 0.002 ether}(0);

        vm.prank(bob);
        vm.expectRevert("Price too low for takeover");
        game.claimCell{value: 0.002 ether}(0);
    }

    function test_TakeoverCell_RefundAccounting() public {
        vm.prank(alice);
        game.claimCell{value: 0.01 ether}(0);

        vm.prank(bob);
        game.claimCell{value: 0.02 ether}(0);

        // Refund = 80% of original price (0.01 ether) = 0.008 ether
        assertEq(game.pendingWithdrawals(alice), 0.008 ether);
        // Fee = 20% of original price = 0.002 ether
        assertEq(game.accumulatedFees(), 0.002 ether);
    }

    function test_Withdraw() public {
        vm.prank(alice);
        game.claimCell{value: 0.01 ether}(0);

        vm.prank(bob);
        game.claimCell{value: 0.02 ether}(0);

        uint256 balanceBefore = alice.balance;
        vm.prank(alice);
        game.withdraw();

        assertEq(alice.balance - balanceBefore, 0.008 ether);
        assertEq(game.pendingWithdrawals(alice), 0);
    }

    function test_Withdraw_NoBalance() public {
        vm.prank(alice);
        vm.expectRevert("Nothing to withdraw");
        game.withdraw();
    }

    function test_WithdrawFees_OnlyOwner() public {
        vm.prank(alice);
        game.claimCell{value: 0.01 ether}(0);
        vm.prank(bob);
        game.claimCell{value: 0.02 ether}(0);

        vm.prank(alice);
        vm.expectRevert("Not owner");
        game.withdrawFees();

        // Owner (this contract) can withdraw
        uint256 balanceBefore = address(this).balance;
        game.withdrawFees();
        assertEq(address(this).balance - balanceBefore, 0.002 ether);
    }

    function test_GetFullGrid() public {
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);
        vm.prank(bob);
        game.claimCell{value: 0.002 ether}(50);

        (address[100] memory owners, uint256[100] memory prices) = game.getFullGrid();
        assertEq(owners[0], alice);
        assertEq(prices[0], 0.001 ether);
        assertEq(owners[50], bob);
        assertEq(prices[50], 0.002 ether);
        assertEq(owners[1], address(0));
        assertEq(prices[1], 0);
    }

    function test_PlayerStats() public {
        vm.startPrank(alice);
        game.claimCell{value: 0.001 ether}(0);
        game.claimCell{value: 0.003 ether}(1);
        vm.stopPrank();

        (uint8 cellCount, uint256 totalPaid, uint256 avgPrice) = game.getPlayerStats(alice);
        assertEq(cellCount, 2);
        assertEq(totalPaid, 0.004 ether);
        assertEq(avgPrice, 0.002 ether);
    }

    function test_PlayerStats_AfterTakeover() public {
        vm.prank(alice);
        game.claimCell{value: 0.01 ether}(0);

        vm.prank(bob);
        game.claimCell{value: 0.02 ether}(0);

        (uint8 aliceCount, uint256 alicePaid,) = game.getPlayerStats(alice);
        assertEq(aliceCount, 0);
        assertEq(alicePaid, 0);

        (uint8 bobCount, uint256 bobPaid,) = game.getPlayerStats(bob);
        assertEq(bobCount, 1);
        assertEq(bobPaid, 0.02 ether);
    }

    function test_InvalidCellId() public {
        vm.prank(alice);
        vm.expectRevert("Invalid cell ID");
        game.claimCell{value: 0.001 ether}(100);
    }

    function test_CellClaimed_Event() public {
        vm.prank(alice);
        vm.expectEmit(true, true, true, true);
        emit TerritoryGame.CellClaimed(0, alice, address(0), 0.001 ether);
        game.claimCell{value: 0.001 ether}(0);
    }

    function test_MultiplePlayers_Grid() public {
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);
        vm.prank(bob);
        game.claimCell{value: 0.001 ether}(1);
        vm.prank(charlie);
        game.claimCell{value: 0.001 ether}(2);

        (address owner0,) = game.getCell(0);
        (address owner1,) = game.getCell(1);
        (address owner2,) = game.getCell(2);
        assertEq(owner0, alice);
        assertEq(owner1, bob);
        assertEq(owner2, charlie);
        assertEq(game.playerCellCount(alice), 1);
        assertEq(game.playerCellCount(bob), 1);
        assertEq(game.playerCellCount(charlie), 1);
    }

    // === Batch claim tests ===

    function test_ClaimMultipleEmptyCells() public {
        uint8[] memory ids = new uint8[](5);
        ids[0] = 0;
        ids[1] = 1;
        ids[2] = 2;
        ids[3] = 3;
        ids[4] = 4;

        vm.prank(alice);
        game.claimCells{value: 0.01 ether}(ids);

        // pricePerCell = 0.01 / 5 = 0.002 ether
        for (uint8 i = 0; i < 5; i++) {
            (address owner, uint256 price) = game.getCell(i);
            assertEq(owner, alice);
            assertEq(price, 0.002 ether);
        }
        assertEq(game.playerCellCount(alice), 5);
        assertEq(game.playerTotalPaid(alice), 0.01 ether);
    }

    function test_ClaimMixedCells() public {
        // Alice claims cell 0
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);

        // Bob takes cell 0 (occupied) + cell 1 (empty) in batch
        uint8[] memory ids = new uint8[](2);
        ids[0] = 0;
        ids[1] = 1;

        vm.prank(bob);
        game.claimCells{value: 0.004 ether}(ids);

        // pricePerCell = 0.004 / 2 = 0.002 ether
        (address owner0, uint256 price0) = game.getCell(0);
        (address owner1, uint256 price1) = game.getCell(1);
        assertEq(owner0, bob);
        assertEq(price0, 0.002 ether);
        assertEq(owner1, bob);
        assertEq(price1, 0.002 ether);

        // Alice refund = 0.001 * 80 / 100 = 0.0008 ether
        assertEq(game.pendingWithdrawals(alice), 0.0008 ether);
    }

    function test_ClaimCells_RefundMultipleOwners() public {
        // Alice claims cell 0, Bob claims cell 1
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);
        vm.prank(bob);
        game.claimCell{value: 0.001 ether}(1);

        // Charlie takes both in one batch
        uint8[] memory ids = new uint8[](2);
        ids[0] = 0;
        ids[1] = 1;

        vm.prank(charlie);
        game.claimCells{value: 0.004 ether}(ids);

        // Both alice and bob get 80% of their original 0.001 ether
        assertEq(game.pendingWithdrawals(alice), 0.0008 ether);
        assertEq(game.pendingWithdrawals(bob), 0.0008 ether);
        assertEq(game.playerCellCount(charlie), 2);
    }

    function test_ClaimCells_RoundingDust() public {
        uint8[] memory ids = new uint8[](3);
        ids[0] = 0;
        ids[1] = 1;
        ids[2] = 2;

        // 0.01 ether / 3 = 3333333333333333 wei per cell, dust = 1 wei
        vm.prank(alice);
        game.claimCells{value: 0.01 ether}(ids);

        uint256 expectedDust = 0.01 ether % 3;
        assertGt(expectedDust, 0);
        assertEq(game.accumulatedFees(), expectedDust);
    }

    function test_ClaimCells_SelfTakeoverReverts() public {
        vm.prank(alice);
        game.claimCell{value: 0.001 ether}(0);

        uint8[] memory ids = new uint8[](1);
        ids[0] = 0;

        vm.prank(alice);
        vm.expectRevert("Cannot takeover own cell");
        game.claimCells{value: 0.002 ether}(ids);
    }

    function test_ClaimCells_DuplicateCellIds() public {
        uint8[] memory ids = new uint8[](2);
        ids[0] = 0;
        ids[1] = 0;

        vm.prank(alice);
        vm.expectRevert("Duplicate cell ID");
        game.claimCells{value: 0.002 ether}(ids);
    }

    function test_ClaimCells_EmptyArray() public {
        uint8[] memory ids = new uint8[](0);

        vm.prank(alice);
        vm.expectRevert("Invalid cell count");
        game.claimCells{value: 0.001 ether}(ids);
    }

    // Receive ETH for fee withdrawal test
    receive() external payable {}
}
