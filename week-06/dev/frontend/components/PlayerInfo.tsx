"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { usePlayerStats, usePendingWithdrawal } from "../hooks/useGameContract";

export default function PlayerInfo() {
  const { address } = useAccount();
  const { cellCount, totalPaid, avgPrice } = usePlayerStats(address);
  const { amount: pendingAmount } = usePendingWithdrawal(address);

  if (!address) {
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-bold text-sm mb-2">My Stats</h3>
        <p className="text-sm text-gray-500">Connect wallet to view stats</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h3 className="font-bold text-sm mb-3">My Stats</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Address:</span>
          <span className="font-mono text-xs">{address.slice(0, 6)}...{address.slice(-4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Cells owned:</span>
          <span className="font-medium">{cellCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Total paid:</span>
          <span className="font-medium">{formatEther(totalPaid)} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Avg price/cell:</span>
          <span className="font-medium">{formatEther(avgPrice)} ETH</span>
        </div>
        {pendingAmount > 0n && (
          <div className="flex justify-between text-green-600">
            <span>Pending refund:</span>
            <span className="font-medium">{formatEther(pendingAmount)} ETH</span>
          </div>
        )}
      </div>
    </div>
  );
}
