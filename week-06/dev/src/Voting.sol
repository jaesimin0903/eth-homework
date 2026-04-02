// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title Voting - 간단한 투표 시스템
/// @notice 후보자 등록, 1인 1표 투표, 결과 조회 기능을 제공합니다
contract Voting {
    // ============================================================
    // 상태 변수
    // ============================================================

    address public owner;
    bool public votingOpen;
    bool public votingEnded;
    string[] public candidateNames;
    mapping(uint256 => uint256) public votes;
    mapping(address => bool) public hasVoted;

    // ============================================================
    // 이벤트
    // ============================================================

    event CandidateAdded(uint256 indexed candidateId, string name);
    event VotingStarted();
    event Voted(address indexed voter, uint256 indexed candidateId);
    event VotingEnded();

    // ============================================================
    // Modifier
    // ============================================================

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whenVotingOpen() {
        require(votingOpen, "Voting is not open");
        _;
    }

    modifier whenVotingClosed() {
        require(!votingOpen, "Voting is still open");
        _;
    }

    // ============================================================
    // 생성자
    // ============================================================

    constructor() {
        owner = msg.sender;
    }

    // ============================================================
    // 외부 함수
    // ============================================================

    /// @notice 후보자를 등록합니다 (투표 시작 전에만 가능)
    function addCandidate(string calldata _name) external onlyOwner whenVotingClosed {
        require(!votingEnded, "Voting already ended");
        uint256 candidateId = candidateNames.length;
        candidateNames.push(_name);
        emit CandidateAdded(candidateId, _name);
    }

    /// @notice 투표를 시작합니다
    function startVoting() external onlyOwner whenVotingClosed {
        require(!votingEnded, "Voting already ended");
        require(candidateNames.length > 0, "No candidates");
        votingOpen = true;
        emit VotingStarted();
    }

    /// @notice 후보자에게 투표합니다 (1인 1표)
    function vote(uint256 candidateId) external whenVotingOpen {
        require(!hasVoted[msg.sender], "Already voted");
        require(candidateId < candidateNames.length, "Invalid candidate");

        // CEI 패턴: 상태 변경 먼저, 이벤트 나중에
        hasVoted[msg.sender] = true;
        votes[candidateId] += 1;

        emit Voted(msg.sender, candidateId);
    }

    /// @notice 투표를 종료합니다
    function endVoting() external onlyOwner whenVotingOpen {
        votingOpen = false;
        votingEnded = true;
        emit VotingEnded();
    }

    // ============================================================
    // View 함수
    // ============================================================

    /// @notice 후보자 수를 반환합니다
    function getCandidateCount() external view returns (uint256) {
        return candidateNames.length;
    }

    /// @notice 특정 후보자의 득표수를 반환합니다
    function getVotes(uint256 candidateId) external view returns (uint256) {
        require(candidateId < candidateNames.length, "Invalid candidate");
        return votes[candidateId];
    }

    /// @notice 최다 득표 후보자의 이름을 반환합니다 (투표 종료 후에만)
    function getWinner() external view returns (string memory) {
        require(votingEnded, "Voting not ended");

        uint256 winningVoteCount = 0;
        uint256 winningId = 0;

        for (uint256 i = 0; i < candidateNames.length; i++) {
            if (votes[i] > winningVoteCount) {
                winningVoteCount = votes[i];
                winningId = i;
            }
        }

        return candidateNames[winningId];
    }
}
