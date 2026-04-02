"use client";

import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { usePendingWithdrawal, useWithdraw } from "../hooks/useGameContract";
import Spinner from "./Spinner";

export default function WithdrawPanel() {
  const { address } = useAccount();
  const { amount } = usePendingWithdrawal(address);
  const { withdraw, isPending } = useWithdraw();

  if (!address || amount <= 0n) return null;

  return (
    <div className="bg-green-50 rounded-xl p-4 shadow-sm border border-green-200">
      <h3 className="font-bold text-sm mb-2 text-green-800">Pending Refund</h3>
      <p className="text-lg font-bold text-green-700 mb-3">
        {formatEther(amount)} ETH
      </p>
      <button
        onClick={() => withdraw()}
        disabled={isPending}
        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
      >
        {isPending ? <><Spinner size={14} className="inline mr-1" /> Withdrawing...</> : "Withdraw Refund"}
      </button>
    </div>
  );
}
