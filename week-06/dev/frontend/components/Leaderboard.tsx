"use client";

import { addressToColor } from "../lib/connectivity";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface LeaderboardProps {
  owners: string[];
}

interface PlayerEntry {
  address: string;
  cellCount: number;
}

export default function Leaderboard({ owners }: LeaderboardProps) {
  const playerMap = new Map<string, number>();

  for (const owner of owners) {
    if (!owner || owner === ZERO_ADDRESS) continue;
    const lower = owner.toLowerCase();
    playerMap.set(lower, (playerMap.get(lower) ?? 0) + 1);
  }

  const rankings: PlayerEntry[] = [...playerMap.entries()]
    .map(([address, cellCount]) => ({ address, cellCount }))
    .sort((a, b) => b.cellCount - a.cellCount)
    .slice(0, 10);

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h3 className="font-bold text-sm mb-3">Leaderboard</h3>
      {rankings.length === 0 ? (
        <p className="text-sm text-gray-500">No players yet</p>
      ) : (
        <div className="space-y-2">
          {rankings.map((entry, i) => (
            <div key={entry.address} className="flex items-center gap-2 text-sm">
              <span className="font-medium w-5 text-gray-500">#{i + 1}</span>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: addressToColor(entry.address) }}
              />
              <span className="font-mono text-xs flex-1">
                {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
              </span>
              <span className="font-medium">{entry.cellCount} cells</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
