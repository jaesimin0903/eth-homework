"use client";

import { formatEther } from "viem";
import { addressToColor } from "../lib/connectivity";

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const BASE_PRICE = BigInt("1000000000000000"); // 0.001 ether

// Terrain map: some cells are "ocean" (decorative), rest are "land"
// This creates a world-map-like silhouette
const OCEAN_CELLS = new Set([
  0, 3, 4, 9,
  10, 19,
  20, 29,
  40, 49,
  50,
  60, 69,
  70, 79,
  80, 83, 84, 89,
  90, 91, 94, 95, 98, 99,
]);

const REGION_NAMES: Record<number, string> = {
  1: "Borea",
  6: "Noria",
  12: "Westa",
  17: "Ostia",
  23: "Vala",
  26: "Cresta",
  34: "Centra",
  45: "Orienta",
  52: "Meridia",
  57: "Levanta",
  63: "Austra",
  76: "Sudia",
  86: "Terra Nova",
};

interface CellProps {
  cellId: number;
  owner: string;
  price: bigint;
  isSelected: boolean;
  isValidTarget: boolean;
  isMyCell: boolean;
  onClick: () => void;
}

export default function Cell({
  cellId,
  owner,
  price,
  isSelected,
  isValidTarget,
  isMyCell,
  onClick,
}: CellProps) {
  const isEmpty = !owner || owner === ZERO_ADDRESS;
  const isOcean = OCEAN_CELLS.has(cellId);
  const displayPrice = isEmpty ? BASE_PRICE : price;
  const row = Math.floor(cellId / 10);
  const col = cellId % 10;
  const regionName = REGION_NAMES[cellId];

  // Ocean cells are not interactive
  if (isOcean && isEmpty) {
    return (
      <div
        className="aspect-square flex items-center justify-center relative"
        style={{
          background: "linear-gradient(135deg, #1e3a5f 0%, #2a4a7f 50%, #1e3a5f 100%)",
          borderRadius: "2px",
        }}
      >
        <span className="text-[6px] text-blue-300/30 select-none">~~~</span>
      </div>
    );
  }

  const playerColor = isEmpty ? undefined : addressToColor(owner);

  // Land cell colors
  let bgStyle: string;
  if (!isEmpty) {
    bgStyle = playerColor!;
  } else {
    // Unclaimed land - terrain colors based on position
    const terrainColors = [
      "#8fbc8f", "#a0c4a0", "#7fb07f", "#90b890",
      "#a8c8a0", "#98b898", "#88b088", "#80a880",
    ];
    bgStyle = terrainColors[(row + col) % terrainColors.length];
  }

  return (
    <button
      onClick={onClick}
      title={`(${row},${col}) ${regionName ? `[${regionName}]` : ""} - ${isEmpty ? "Unclaimed" : `Owner: ${owner.slice(0, 6)}...`} - ${formatEther(displayPrice)} ETH`}
      className="aspect-square flex items-center justify-center relative transition-all duration-200 group"
      style={{
        background: isSelected
          ? `repeating-linear-gradient(45deg, ${bgStyle}, ${bgStyle} 3px, rgba(29,78,216,0.4) 3px, rgba(29,78,216,0.4) 6px)`
          : bgStyle,
        border: isSelected
          ? "2px solid #3b82f6"
          : isMyCell
            ? "2px solid rgba(255,255,255,0.9)"
            : "1px solid rgba(0,0,0,0.15)",
        opacity: !isSelected && !isValidTarget && !isEmpty && !isMyCell ? 0.75 : 1,
        cursor: isValidTarget || isSelected ? "pointer" : "default",
        borderRadius: "2px",
        boxShadow: isMyCell
          ? "inset 0 0 8px rgba(255,255,255,0.3)"
          : !isEmpty
            ? "inset 0 0 6px rgba(0,0,0,0.2)"
            : "inset 0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      {/* Region name label */}
      {regionName && isEmpty && (
        <span className="text-[7px] font-bold text-gray-700/60 select-none leading-none text-center px-0.5">
          {regionName}
        </span>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <span className="text-white font-bold text-sm drop-shadow-md">+</span>
      )}

      {/* Owned flag indicator */}
      {!isEmpty && !isSelected && (
        <span className="text-[8px] font-bold text-white/80 drop-shadow select-none">
          {isMyCell ? "\u2691" : "\u2690"}
        </span>
      )}

      {/* Hover tooltip price */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap z-10 pointer-events-none">
        {formatEther(displayPrice)} ETH
      </div>
    </button>
  );
}
