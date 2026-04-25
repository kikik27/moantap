// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MOANTAP — On-chain score tracker for the MOANTAP tap game
contract MOANTAP is Ownable {
    // ── Storage ──────────────────────────────────────────────────────────────

    mapping(address => uint256) public totalPoints;
    mapping(address => uint256) public pvpWins;
    mapping(address => uint256) public pvpLosses;

    /// @notice Addresses authorised to call recordTap / recordPvPResult
    mapping(address => bool) public operators;

    // ── Events ───────────────────────────────────────────────────────────────

    event TapRecorded(address indexed player, uint256 amount, uint256 total, string username);
    event PvPResultRecorded(
        address indexed winner,
        address indexed loser,
        uint256 winnerTotal,
        uint256 loserTotal,
        string winnerUsername,
        string loserUsername
    );
    event OperatorSet(address indexed operator, bool enabled);

    // ── Errors ───────────────────────────────────────────────────────────────

    error NotOperator();
    error ZeroAddress();
    error SamePlayer();

    // ── Modifiers ────────────────────────────────────────────────────────────

    modifier onlyOperator() {
        if (!operators[msg.sender]) revert NotOperator();
        _;
    }

    // ── Constructor ──────────────────────────────────────────────────────────

    constructor(address initialOwner) Ownable(initialOwner) {}

    // ── Admin ────────────────────────────────────────────────────────────────

    /// @notice Grant or revoke operator permission
    function setOperator(address operator, bool enabled) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = enabled;
        emit OperatorSet(operator, enabled);
    }

    // ── Game actions ─────────────────────────────────────────────────────────

    /// @notice Record tap score for a player (called by backend operator)
    function recordTap(address player, uint256 amount, string calldata username) external onlyOperator {
        if (player == address(0)) revert ZeroAddress();
        totalPoints[player] += amount;
        emit TapRecorded(player, amount, totalPoints[player], username);
    }

    /// @notice Record PvP match result — winner +500, loser +200 consolation
    function recordPvPResult(
        address winner,
        address loser,
        string calldata winnerUsername,
        string calldata loserUsername
    ) external onlyOperator {
        if (winner == address(0) || loser == address(0)) revert ZeroAddress();
        if (winner == loser) revert SamePlayer();

        totalPoints[winner] += 500;
        pvpWins[winner] += 1;

        totalPoints[loser] += 200;
        pvpLosses[loser] += 1;

        emit PvPResultRecorded(winner, loser, totalPoints[winner], totalPoints[loser], winnerUsername, loserUsername);
    }

    // ── Views ────────────────────────────────────────────────────────────────

    function getPlayerStats(address player)
        external
        view
        returns (uint256 points, uint256 wins, uint256 losses)
    {
        return (totalPoints[player], pvpWins[player], pvpLosses[player]);
    }
}
