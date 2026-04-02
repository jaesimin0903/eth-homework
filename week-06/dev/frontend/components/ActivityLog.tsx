"use client";

import { useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { formatEther } from "viem";
import { TERRITORY_GAME_ADDRESS, TERRITORY_GAME_ABI } from "../config/contract";
import { addressToColor } from "../lib/connectivity";

interface LogEntry {
  type: "claim" | "refund" | "withdraw";
  cellId?: number;
  player: string;
  amount: bigint;
  timestamp: number;
}

export default function ActivityLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useWatchContractEvent({
    address: TERRITORY_GAME_ADDRESS as `0x${string}`,
    abi: TERRITORY_GAME_ABI,
    eventName: "CellClaimed",
    onLogs: (events) => {
      const newEntries = events.map((e) => ({
        type: "claim" as const,
        cellId: Number(e.args.cellId),
        player: e.args.newOwner as string,
        amount: e.args.price as bigint,
        timestamp: Date.now(),
      }));
      setLogs((prev) => [...newEntries, ...prev].slice(0, 20));
    },
  });

  useWatchContractEvent({
    address: TERRITORY_GAME_ADDRESS as `0x${string}`,
    abi: TERRITORY_GAME_ABI,
    eventName: "RefundWithdrawn",
    onLogs: (events) => {
      const newEntries = events.map((e) => ({
        type: "withdraw" as const,
        player: e.args.player as string,
        amount: e.args.amount as bigint,
        timestamp: Date.now(),
      }));
      setLogs((prev) => [...newEntries, ...prev].slice(0, 20));
    },
  });

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h3 className="font-bold text-sm mb-3">Activity Log</h3>
      {logs.length === 0 ? (
        <p className="text-sm text-gray-500">No activity yet</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {logs.map((log, i) => (
            <div key={i} className="flex items-start gap-2 text-xs">
              <span className="text-gray-400 font-mono flex-shrink-0">
                {formatTime(log.timestamp)}
              </span>
              <div
                className="w-2 h-2 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: addressToColor(log.player) }}
              />
              <span className="text-gray-700">
                {log.type === "claim" && (
                  <>
                    <span className="font-mono">{log.player.slice(0, 6)}...</span>
                    {" claimed cell "}
                    <span className="font-medium">
                      ({Math.floor(log.cellId! / 10)},{log.cellId! % 10})
                    </span>
                    {" for "}
                    <span className="font-medium text-blue-600">
                      {formatEther(log.amount)} ETH
                    </span>
                  </>
                )}
                {log.type === "withdraw" && (
                  <>
                    <span className="font-mono">{log.player.slice(0, 6)}...</span>
                    {" withdrew "}
                    <span className="font-medium text-green-600">
                      {formatEther(log.amount)} ETH
                    </span>
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
