// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MOANTAP} from "../src/MOANTAP.sol";
import {ScoreTracker} from "../src/ScoreTracker.sol";
import {AchievementNFT} from "../src/AchievementNFT.sol";

/// @notice Deploy all MOANTAP contracts to a target network
/// Usage:
///   forge script script/Deploy.s.sol --rpc-url $MONAD_RPC_URL \
///     --private-key $PRIVATE_KEY --broadcast --verify
contract DeployScript is Script {
    function run() external {
        address deployer = vm.envAddress("DEPLOYER_ADDRESS");
        uint256 privateKey = vm.envUint("PRIVATE_KEY");

        vm.startBroadcast(privateKey);

        MOANTAP moantap = new MOANTAP(deployer);
        ScoreTracker scoreTracker = new ScoreTracker(deployer);
        AchievementNFT achievementNFT = new AchievementNFT(deployer);

        console.log("MOANTAP:       ", address(moantap));
        console.log("ScoreTracker:  ", address(scoreTracker));
        console.log("AchievementNFT:", address(achievementNFT));

        vm.stopBroadcast();
    }
}
