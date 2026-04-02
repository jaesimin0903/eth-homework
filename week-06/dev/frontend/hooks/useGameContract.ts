"use client";

import { useReadContract, useWriteContract, useWatchContractEvent, useAccount, useChainId } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { parseEther, formatEther } from "viem";
import { TERRITORY_GAME_ADDRESS, TERRITORY_GAME_ABI } from "../config/contract";

const contractConfig = {
  address: TERRITORY_GAME_ADDRESS as `0x${string}`,
  abi: TERRITORY_GAME_ABI,
} as const;

export function useFullGrid() {
  const result = useReadContract({
    ...contractConfig,
    functionName: "getFullGrid",
    query: {
      refetchInterval: 5000,
    },
  });

  const chainId = useChainId();
  console.log("[useFullGrid] chainId:", chainId);
  console.log("[useFullGrid] address:", contractConfig.address);
  console.log("[useFullGrid] status:", result.status);
  console.log("[useFullGrid] error:", result.error?.message);
  console.log("[useFullGrid] data type:", typeof result.data, result.data ? "has data" : "no data");

  const data = result.data as readonly [readonly string[], readonly bigint[]] | undefined;
  const owners = data ? Array.from(data[0]) : [];
  const prices = data ? Array.from(data[1]) : [];

  return {
    owners,
    prices,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error,
    refetch: result.refetch,
  };
}

export function useClaimCells() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const claimCells = (cellIds: number[], totalValue: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: "claimCells",
      args: [cellIds],
      value: totalValue,
    });
  };

  return { claimCells, isPending, isSuccess, error };
}

export function useClaimCell() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const claimCell = (cellId: number, value: bigint) => {
    writeContract({
      ...contractConfig,
      functionName: "claimCell",
      args: [cellId],
      value,
    });
  };

  return { claimCell, isPending, isSuccess, error };
}

export function useWithdraw() {
  const { writeContract, isPending, isSuccess, error } = useWriteContract();

  const withdraw = () => {
    writeContract({
      ...contractConfig,
      functionName: "withdraw",
    });
  };

  return { withdraw, isPending, isSuccess, error };
}

export function usePendingWithdrawal(address?: string) {
  const result = useReadContract({
    ...contractConfig,
    functionName: "pendingWithdrawals",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  return {
    amount: (result.data as bigint) ?? 0n,
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}

export function usePlayerStats(address?: string) {
  const result = useReadContract({
    ...contractConfig,
    functionName: "getPlayerStats",
    args: address ? [address as `0x${string}`] : undefined,
    query: { enabled: !!address },
  });

  const data = result.data as [number, bigint, bigint] | undefined;

  return {
    cellCount: data?.[0] ?? 0,
    totalPaid: data?.[1] ?? 0n,
    avgPrice: data?.[2] ?? 0n,
    isLoading: result.isLoading,
    refetch: result.refetch,
  };
}

export function useGameEvents(onCellClaimed?: () => void) {
  useWatchContractEvent({
    ...contractConfig,
    eventName: "CellClaimed",
    onLogs: () => {
      onCellClaimed?.();
    },
  });
}

export { formatEther, parseEther };
