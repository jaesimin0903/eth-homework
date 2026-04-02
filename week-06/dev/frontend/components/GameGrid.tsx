"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import Cell from "./Cell";
import ClaimDialog from "./ClaimDialog";
import Spinner from "./Spinner";
import { useFullGrid, useClaimCells, useGameEvents } from "../hooks/useGameContract";
import { areAllConnected } from "../lib/connectivity";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BASE_PRICE = BigInt("1000000000000000"); // 0.001 ether

const COL_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

export default function GameGrid() {
  const { address } = useAccount();
  const { owners, prices, isLoading, isError, error, refetch } = useFullGrid();
  const { claimCells, isPending } = useClaimCells();
  const [selectedCells, setSelectedCells] = useState<Set<number>>(new Set());
  const [showDialog, setShowDialog] = useState(false);

  useGameEvents(() => {
    refetch();
  });

  useEffect(() => {
    if (isPending) {
      setSelectedCells(new Set());
      setShowDialog(false);
    }
  }, [isPending]);

  const grid = useMemo(
    () => ({ owners: owners as string[], prices: prices as bigint[] }),
    [owners, prices]
  );

  const isValidTarget = useCallback(
    (cellId: number) => {
      if (!address || owners.length === 0) return false;
      const owner = owners[cellId];
      if (owner?.toLowerCase() === address.toLowerCase()) return false;
      const newSelection = [...selectedCells, cellId];
      return areAllConnected(grid, address, newSelection);
    },
    [address, owners, selectedCells, grid]
  );

  const handleCellClick = useCallback(
    (cellId: number) => {
      if (!address) return;
      if (owners[cellId]?.toLowerCase() === address.toLowerCase()) return;

      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (next.has(cellId)) {
          next.delete(cellId);
          if (next.size > 0 && !areAllConnected(grid, address, [...next])) {
            return prev;
          }
          return next;
        }
        const candidateSelection = [...next, cellId];
        if (areAllConnected(grid, address, candidateSelection)) {
          next.add(cellId);
          return next;
        }
        return prev;
      });
    },
    [address, grid, owners]
  );

  const calculateTotalCost = useCallback(() => {
    if (selectedCells.size === 0) return 0n;
    let maxRequiredPerCell = BASE_PRICE;
    for (const cellId of selectedCells) {
      const owner = owners[cellId];
      if (owner && owner !== ZERO_ADDRESS) {
        const cellPrice = prices[cellId] ?? 0n;
        if (cellPrice >= maxRequiredPerCell) {
          maxRequiredPerCell = cellPrice + 1n;
        }
      }
    }
    return maxRequiredPerCell * BigInt(selectedCells.size);
  }, [selectedCells, owners, prices]);

  const handleConfirm = useCallback(
    (totalValue: bigint) => {
      const cellIds = [...selectedCells].sort((a, b) => a - b);
      claimCells(cellIds, totalValue);
      setShowDialog(false);
      setSelectedCells(new Set());
    },
    [selectedCells, claimCells]
  );

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500 gap-2">
        <p>Failed to load grid</p>
        <p className="text-xs text-gray-500">{error?.message?.slice(0, 100)}</p>
        <button onClick={() => refetch()} className="text-sm text-blue-500 underline">Retry</button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading world map...
      </div>
    );
  }

  return (
    <div>
      {/* Column labels */}
      <div className="flex mx-auto mb-1" style={{ maxWidth: "540px", paddingLeft: "28px" }}>
        {COL_LABELS.map((label) => (
          <div key={label} className="flex-1 text-center text-[10px] text-gray-400 font-mono">
            {label}
          </div>
        ))}
      </div>

      <div className="flex mx-auto" style={{ maxWidth: "540px" }}>
        {/* Row labels */}
        <div className="flex flex-col justify-around pr-1" style={{ width: "24px" }}>
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="flex-1 flex items-center justify-center text-[10px] text-gray-400 font-mono">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Map grid */}
        <div
          className="grid flex-1 rounded-lg overflow-hidden"
          style={{
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: "2px",
            background: "linear-gradient(180deg, #152238 0%, #1a3050 50%, #152238 100%)",
            padding: "3px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3), inset 0 0 30px rgba(0,0,0,0.2)",
          }}
        >
          {Array.from({ length: 100 }, (_, i) => (
            <Cell
              key={i}
              cellId={i}
              owner={owners[i] ?? ZERO_ADDRESS}
              price={prices[i] ?? 0n}
              isSelected={selectedCells.has(i)}
              isValidTarget={isValidTarget(i)}
              isMyCell={
                !!address &&
                owners[i]?.toLowerCase() === address.toLowerCase()
              }
              onClick={() => handleCellClick(i)}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-3 text-[10px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: "#8fbc8f" }} />
          Unclaimed
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: "linear-gradient(135deg, #1e3a5f, #2a4a7f)" }} />
          Ocean
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded border-2 border-white" style={{ background: "#e67e22" }} />
          My Territory
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block w-3 h-3 rounded" style={{ background: "#9b59b6" }} />
          Other Player
        </span>
      </div>

      {/* Selection controls */}
      {selectedCells.size > 0 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <span className="text-sm text-gray-600">
            {selectedCells.size} territories selected
          </span>
          <button
            onClick={() => setShowDialog(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium shadow-md"
          >
            Conquer ({formatEther(calculateTotalCost())} ETH)
          </button>
          <button
            onClick={() => setSelectedCells(new Set())}
            className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Clear
          </button>
        </div>
      )}

      {showDialog && (
        <ClaimDialog
          selectedCellIds={[...selectedCells]}
          owners={owners as string[]}
          prices={prices as bigint[]}
          minCost={calculateTotalCost()}
          onConfirm={handleConfirm}
          onCancel={() => setShowDialog(false)}
        />
      )}

      {isPending && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm text-yellow-600">
          <Spinner size={16} className="text-yellow-600" />
          Conquering territory...
        </div>
      )}
    </div>
  );
}
