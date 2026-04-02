"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import GameGrid from "../components/GameGrid";
import PlayerInfo from "../components/PlayerInfo";
import Leaderboard from "../components/Leaderboard";
import WithdrawPanel from "../components/WithdrawPanel";
import Faucet from "../components/Faucet";
import ActivityLog from "../components/ActivityLog";
import { useFullGrid } from "../hooks/useGameContract";

export default function Home() {
  const { owners } = useFullGrid();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Territory Conquest</h1>
          <ConnectButton />
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-4 shadow-sm border">
              <h2 className="font-bold text-sm mb-3 text-gray-700">
                World Map - Click territories to conquer
              </h2>
              <GameGrid />
            </div>
          </div>

          <div className="space-y-4">
            <Faucet />
            <PlayerInfo />
            <WithdrawPanel />
            <Leaderboard owners={owners as string[]} />
            <ActivityLog />
          </div>
        </div>
      </div>
    </main>
  );
}
