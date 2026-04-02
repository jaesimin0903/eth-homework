// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Script.sol";
import "../src/TerritoryGame.sol";

contract DeployTerritoryGame is Script {
    function run() external {
        vm.startBroadcast();
        TerritoryGame game = new TerritoryGame();
        console.log("TerritoryGame deployed at:", address(game));
        vm.stopBroadcast();
    }
}
