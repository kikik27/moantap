// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {MOANTAP} from "../src/MOANTAP.sol";
import {ScoreTracker} from "../src/ScoreTracker.sol";
import {AchievementNFT} from "../src/AchievementNFT.sol";

contract MOANTAPTest is Test {
    MOANTAP moantap;
    ScoreTracker scoreTracker;
    AchievementNFT achievementNFT;

    address owner = address(this);
    address operator = makeAddr("operator");
    address playerA = makeAddr("playerA");
    address playerB = makeAddr("playerB");

    function setUp() public {
        moantap = new MOANTAP(owner);
        scoreTracker = new ScoreTracker(owner);
        achievementNFT = new AchievementNFT(owner);

        moantap.setOperator(operator, true);
        scoreTracker.setOperator(operator, true);
        achievementNFT.setOperator(operator, true);
    }

    // ── MOANTAP ───────────────────────────────────────────────────────────────

    function test_RecordTap() public {
        vm.prank(operator);
        moantap.recordTap(playerA, 100, "TestUser");
        (uint256 pts,,) = moantap.getPlayerStats(playerA);
        assertEq(pts, 100);
    }

    function test_RecordPvPResult() public {
        vm.prank(operator);
        moantap.recordPvPResult(playerA, playerB, "PlayerA", "PlayerB");

        (uint256 ptsA, uint256 winsA,) = moantap.getPlayerStats(playerA);
        (uint256 ptsB,, uint256 lossesB) = moantap.getPlayerStats(playerB);

        assertEq(ptsA, 500);
        assertEq(winsA, 1);
        assertEq(ptsB, 200);
        assertEq(lossesB, 1);
    }

    function test_RecordTap_NotOperator_Reverts() public {
        vm.prank(playerA);
        vm.expectRevert(MOANTAP.NotOperator.selector);
        moantap.recordTap(playerA, 100, "TestUser");
    }

    function test_RecordPvPResult_SamePlayer_Reverts() public {
        vm.prank(operator);
        vm.expectRevert(MOANTAP.SamePlayer.selector);
        moantap.recordPvPResult(playerA, playerA, "A", "A");
    }

    // ── ScoreTracker ──────────────────────────────────────────────────────────

    function test_SubmitScore() public {
        vm.prank(operator);
        scoreTracker.submitScore(playerA, 1234, 50, 10, 30, "TestUser");

        assertEq(scoreTracker.sessionCount(playerA), 1);
        ScoreTracker.SessionScore memory s = scoreTracker.latestSession(playerA);
        assertEq(s.score, 1234);
        assertEq(s.taps, 50);
        assertEq(s.maxCombo, 10);
        assertEq(s.duration, 30);
    }

    // ── AchievementNFT ────────────────────────────────────────────────────────

    function test_MintBadge() public {
        vm.prank(operator);
        uint256 tokenId = achievementNFT.mintBadge(playerA, AchievementNFT.Badge.FirstTap, "ipfs://CID");

        assertEq(achievementNFT.ownerOf(tokenId), playerA);
        assertTrue(achievementNFT.hasBadge(playerA, AchievementNFT.Badge.FirstTap));
    }

    function test_MintBadge_Duplicate_Reverts() public {
        vm.startPrank(operator);
        achievementNFT.mintBadge(playerA, AchievementNFT.Badge.FirstTap, "ipfs://CID");
        vm.expectRevert(AchievementNFT.AlreadyMinted.selector);
        achievementNFT.mintBadge(playerA, AchievementNFT.Badge.FirstTap, "ipfs://CID2");
        vm.stopPrank();
    }

    function test_Transfer_Soulbound_Reverts() public {
        vm.prank(operator);
        uint256 tokenId = achievementNFT.mintBadge(playerA, AchievementNFT.Badge.FirstTap, "ipfs://CID");

        vm.prank(playerA);
        vm.expectRevert(AchievementNFT.Soulbound.selector);
        achievementNFT.transferFrom(playerA, playerB, tokenId);
    }
}
