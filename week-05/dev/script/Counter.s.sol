// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import "forge-std/Script.sol";
import "../src/Counter.sol";

contract CounterScript is Script {
    function run() external {
        vm.startBroadcast();

        // 1. 카운터 컨트랙트 배포
        Counter counter = new Counter();
        console.log("Counter deployed at:", address(counter));

        // 2. 특정 주소로 테스트 이더(ETH) 전송하기
        address payable toUser = payable(0xF8D09e078D3552Ba1a5ae9876D3b24AA10B1EFAD);
        uint256 amountToFund = 10 ether;

        // 이더 전송 후 성공 여부 확인
        (bool success, ) = toUser.call{ value: amountToFund }("");
        require(success, "ETH Transfer failed in deployment script");

        console.log("Sent", amountToFund / 1e18, "ETH to:", toUser);

        vm.stopBroadcast();
    }
}
