"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

interface ClaimDialogProps {
  selectedCellIds: number[];
  owners: string[];
  prices: bigint[];
  minCost: bigint;
  onConfirm: (value: bigint) => void;
  onCancel: () => void;
}

export default function ClaimDialog({
  selectedCellIds,
  owners,
  prices,
  minCost,
  onConfirm,
  onCancel,
}: ClaimDialogProps) {
  const [customAmount, setCustomAmount] = useState(formatEther(minCost));

  const emptyCells = selectedCellIds.filter(
    (id) => !owners[id] || owners[id] === ZERO_ADDRESS
  );
  const occupiedCells = selectedCellIds.filter(
    (id) => owners[id] && owners[id] !== ZERO_ADDRESS
  );

  const handleConfirm = () => {
    try {
      const value = parseEther(customAmount);
      if (value >= minCost) {
        onConfirm(value);
      }
    } catch {
      // invalid input
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
        <h3 className="text-lg font-bold mb-4">Claim Territory</h3>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total cells:</span>
            <span className="font-medium">{selectedCellIds.length}</span>
          </div>
          {emptyCells.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Empty cells:</span>
              <span className="text-green-600">{emptyCells.length}</span>
            </div>
          )}
          {occupiedCells.length > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Takeover cells:</span>
              <span className="text-red-600">{occupiedCells.length}</span>
            </div>
          )}

          {occupiedCells.length > 0 && (
            <div className="bg-red-50 p-3 rounded-lg text-xs text-red-700">
              <p className="font-medium mb-1">Takeover details:</p>
              {occupiedCells.map((id) => (
                <div key={id} className="flex justify-between">
                  <span>Cell ({Math.floor(id / 10)},{id % 10})</span>
                  <span>Current: {formatEther(prices[id] ?? 0n)} ETH</span>
                </div>
              ))}
            </div>
          )}

          <div className="border-t pt-3">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Minimum cost:</span>
              <span className="font-medium">{formatEther(minCost)} ETH</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Price per cell:</span>
              <span className="font-medium">
                {selectedCellIds.length > 0
                  ? formatEther(minCost / BigInt(selectedCellIds.length))
                  : "0"}{" "}
                ETH
              </span>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600 block mb-1">
              Amount (ETH):
            </label>
            <input
              type="text"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder={formatEther(minCost)}
            />
            <p className="text-xs text-gray-500 mt-1">
              Pay more to make cells harder to takeover
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
          >
            Claim Territory
          </button>
        </div>
      </div>
    </div>
  );
}
