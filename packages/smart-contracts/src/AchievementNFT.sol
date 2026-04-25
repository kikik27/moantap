// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title AchievementNFT — Soulbound badges for MOANTAP achievements
contract AchievementNFT is ERC721URIStorage, Ownable {
    // ── Types ─────────────────────────────────────────────────────────────────

    enum Badge {
        FirstTap,       // 0 — Played first game
        Combo10,        // 1 — Reached 10x combo
        Combo50,        // 2 — Reached 50x combo
        PvPVictor,      // 3 — Won first PvP match
        PvP10Wins,      // 4 — Won 10 PvP matches
        TapMaster,      // 5 — 10,000 total taps
        PointsLegend    // 6 — 100,000 total points
    }

    // ── Storage ───────────────────────────────────────────────────────────────

    uint256 private _nextTokenId;

    /// @notice Track which badges a player has already minted (prevents duplicates)
    mapping(address => mapping(Badge => bool)) public hasBadge;

    /// @notice Authorised minters (game backend)
    mapping(address => bool) public operators;

    // ── Events ────────────────────────────────────────────────────────────────

    event BadgeMinted(address indexed player, Badge badge, uint256 tokenId);
    event OperatorSet(address indexed operator, bool enabled);

    // ── Errors ────────────────────────────────────────────────────────────────

    error NotOperator();
    error ZeroAddress();
    error AlreadyMinted();
    /// @notice Soulbound — transfers are blocked
    error Soulbound();

    // ── Modifiers ─────────────────────────────────────────────────────────────

    modifier onlyOperator() {
        if (!operators[msg.sender]) revert NotOperator();
        _;
    }

    // ── Constructor ───────────────────────────────────────────────────────────

    constructor(address initialOwner)
        ERC721("MOANTAP Achievement", "MOAN")
        Ownable(initialOwner)
    {}

    // ── Admin ─────────────────────────────────────────────────────────────────

    function setOperator(address operator, bool enabled) external onlyOwner {
        if (operator == address(0)) revert ZeroAddress();
        operators[operator] = enabled;
        emit OperatorSet(operator, enabled);
    }

    // ── Mint ──────────────────────────────────────────────────────────────────

    /// @notice Mint a badge NFT for a player (one per badge type per address)
    function mintBadge(address player, Badge badge, string calldata uri)
        external
        onlyOperator
        returns (uint256 tokenId)
    {
        if (player == address(0)) revert ZeroAddress();
        if (hasBadge[player][badge]) revert AlreadyMinted();

        tokenId = _nextTokenId++;
        hasBadge[player][badge] = true;

        _safeMint(player, tokenId);
        _setTokenURI(tokenId, uri);

        emit BadgeMinted(player, badge, tokenId);
    }

    // ── Soulbound (no transfers) ──────────────────────────────────────────────

    function transferFrom(address, address, uint256) public pure override(ERC721, IERC721) {
        revert Soulbound();
    }
}
