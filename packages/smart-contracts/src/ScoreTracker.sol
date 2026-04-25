// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ScoreTracker — Per-session score snapshots for the MOANTAP game
contract ScoreTracker is Ownable {
    // ── Structs ───────────────────────────────────────────────────────────────

    struct SessionScore {
        uint256 score;
        uint32 taps;
        uint32 maxCombo;
        uint32 duration; // seconds
        uint64 timestamp;
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    /// @notice All sessions for a player, ordered oldest→newest
    mapping(address => SessionScore[]) private _sessions;

    /// @notice Authorised callers (game backend)
    mapping(address => bool) public operators;

    // ── Events ────────────────────────────────────────────────────────────────

    event ScoreSubmitted(
        address indexed player,
        uint256 score,
        uint32 taps,
        uint32 maxCombo,
        uint32 duration,
        uint64 timestamp
    );
    event OperatorSet(address indexed operator, bool enabled);

    // ── Errors ────────────────────────────────────────────────────────────────

    error NotOperator();
    error ZeroAddress();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOperator() {
        if (!operators[msg.sender]) revert NotOperator();
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setOperator(address operator, bool enabled) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = enabled;
        emit OperatorSet(operator, enabled);
    }

    // ── Game actions ──────────────────────────────────────────────────────────

    /// @notice Submit a completed game session score
    function submitScore(
        address player,
        uint256 score,
        uint32 taps,
        uint32 maxCombo,
        uint32 duration
    ) external onlyOperator {
        if (player == address(0)) revert ZeroAddress();

        uint64 ts = uint64(block.timestamp);
        _sessions[player].push(SessionScore(score, taps, maxCombo, duration, ts));

        emit ScoreSubmitted(player, score, taps, maxCombo, duration, ts);
    }

    // ── Views ─────────────────────────────────────────────────────────────────

    /// @notice Total number of sessions for a player
    function sessionCount(address player) external view returns (uint256) {
        return _sessions[player].length;
    }

    /// @notice Get latest session for a player
    function latestSession(address player) external view returns (SessionScore memory) {
        SessionScore[] storage s = _sessions[player];
        require(s.length > 0, "no sessions");
        return s[s.length - 1];
    }

    /// @notice Get paginated sessions (most recent first)
    function getSessions(address player, uint256 offset, uint256 limit)
        external
        view
        returns (SessionScore[] memory result)
    {
        SessionScore[] storage s = _sessions[player];
        uint256 total = s.length;
        if (offset >= total) return result;

        uint256 end = total - offset;
        uint256 start = end > limit ? end - limit : 0;
        result = new SessionScore[](end - start);
        for (uint256 i = start; i < end; i++) {
            result[end - 1 - i] = s[i]; // reverse order
        }
    }
}
