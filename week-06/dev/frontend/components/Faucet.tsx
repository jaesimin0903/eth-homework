"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

export default function Faucet() {
  const { address } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!address) return null;

  const handleFaucet = async () => {
    setIsPending(true);
    setSuccess(false);
    try {
      // Anvil supports hardhat_setBalance RPC method
      await fetch("http://127.0.0.1:8545", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "anvil_setBalance",
          params: [address, "0x56BC75E2D63100000"], // 100 ETH
          id: 1,
        }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      console.error("Faucet error:", e);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h3 className="font-bold text-sm mb-2">Test Faucet</h3>
      <button
        onClick={handleFaucet}
        disabled={isPending}
        className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm font-medium"
      >
        {isPending ? "Sending..." : "Get 100 Test ETH"}
      </button>
      {success && (
        <p className="text-xs text-green-600 mt-2 text-center">100 ETH added!</p>
      )}
    </div>
  );
}
