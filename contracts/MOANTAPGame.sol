// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MOANTAPGame {
    mapping(address => uint256) public totalPoints;
    mapping(address => uint256) public pvpWins;

    event TapRecorded(address indexed player, uint256 amount, uint256 totalPoints);
    event PvPWinRecorded(address indexed winner, address indexed loser, uint256 winnerPoints, uint256 loserPoints);

    function recordTap(address player, uint256 amount) external {
        totalPoints[player] += amount;
        emit TapRecorded(player, amount, totalPoints[player]);
    }

    function recordPvPWin(address winner, address loser) external {
        // Winner: +500 points, +1 win
        totalPoints[winner] += 500;
        pvpWins[winner] += 1;

        // Loser: +200 consolation points
        totalPoints[loser] += 200;

        emit PvPWinRecorded(winner, loser, totalPoints[winner], totalPoints[loser]);
    }

    function getPlayerStats(address player) external view returns (uint256 points, uint256 wins) {
        return (totalPoints[player], pvpWins[player]);
    }
}
