// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Test.sol";
import "../src/Voting.sol";

/// @title VotingTest - Week 6 투표 컨트랙트 테스트
contract VotingTest is Test {
    Voting public voting;
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");

    function setUp() public {
        voting = new Voting();
    }

    /// @notice 후보자 등록 성공
    function test_AddCandidate() public {
        vm.expectEmit(true, false, false, true);
        emit Voting.CandidateAdded(0, "Alice");

        voting.addCandidate("Alice");

        assertEq(voting.getCandidateCount(), 1);
        assertEq(voting.candidateNames(0), "Alice");
    }

    /// @notice 비소유자 등록 시도 revert
    function test_AddCandidate_RevertIfNotOwner() public {
        vm.prank(alice);
        vm.expectRevert("Not owner");
        voting.addCandidate("Alice");
    }

    /// @notice 정상 투표 및 득표수 증가
    function test_Vote() public {
        voting.addCandidate("Alice");
        voting.addCandidate("Bob");
        voting.startVoting();

        vm.prank(alice);
        vm.expectEmit(true, true, false, true);
        emit Voting.Voted(alice, 0);
        voting.vote(0);

        assertEq(voting.getVotes(0), 1);
        assertTrue(voting.hasVoted(alice));
    }

    /// @notice 중복 투표 revert
    function test_Vote_RevertIfAlreadyVoted() public {
        voting.addCandidate("Alice");
        voting.startVoting();

        vm.startPrank(alice);
        voting.vote(0);

        vm.expectRevert("Already voted");
        voting.vote(0);
        vm.stopPrank();
    }

    /// @notice 투표 미시작 시 revert
    function test_Vote_RevertIfVotingNotOpen() public {
        voting.addCandidate("Alice");

        vm.prank(alice);
        vm.expectRevert("Voting is not open");
        voting.vote(0);
    }

    /// @notice 투표 종료 후 승자 조회
    function test_EndVoting_And_GetWinner() public {
        voting.addCandidate("Alice");
        voting.addCandidate("Bob");
        voting.startVoting();

        vm.prank(alice);
        voting.vote(0);
        vm.prank(bob);
        voting.vote(0);

        vm.expectEmit(false, false, false, true);
        emit Voting.VotingEnded();
        voting.endVoting();

        assertEq(voting.getWinner(), "Alice");
    }

    /// @notice 투표 중 승자 조회 revert
    function test_GetWinner_RevertIfVotingNotEnded() public {
        voting.addCandidate("Alice");
        voting.startVoting();

        vm.expectRevert("Voting not ended");
        voting.getWinner();
    }
}
