// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Script.sol";
import "../src/Counter.sol";

contract CounterScript is Script {
    function run() external {
        vm.broadcast();
        Counter counter = new Counter();
        console.log("Counter deployed at:", address(counter));
    }
}
