export type GridState = {
  owners: string[];
  prices: bigint[];
};

const GRID_SIZE = 10;

/**
 * Get adjacent cell IDs (up/down/left/right), handling edges and corners
 */
export function getAdjacentCells(cellId: number): number[] {
  const row = Math.floor(cellId / GRID_SIZE);
  const col = cellId % GRID_SIZE;
  const neighbors: number[] = [];

  if (row > 0) neighbors.push((row - 1) * GRID_SIZE + col); // up
  if (row < GRID_SIZE - 1) neighbors.push((row + 1) * GRID_SIZE + col); // down
  if (col > 0) neighbors.push(row * GRID_SIZE + (col - 1)); // left
  if (col < GRID_SIZE - 1) neighbors.push(row * GRID_SIZE + (col + 1)); // right

  return neighbors;
}

/**
 * Check if a single cell is adjacent to any cell owned by the player.
 * Returns true if player owns no cells (first claim is always valid).
 */
export function isConnected(
  grid: GridState,
  playerAddress: string,
  newCellId: number
): boolean {
  const normalizedPlayer = playerAddress.toLowerCase();

  // Check if player owns any cells
  const playerOwnsAny = grid.owners.some(
    (owner) => owner.toLowerCase() === normalizedPlayer
  );

  // First claim is always valid
  if (!playerOwnsAny) return true;

  // Check if newCellId is adjacent to any player-owned cell
  const neighbors = getAdjacentCells(newCellId);
  return neighbors.some(
    (n) => grid.owners[n]?.toLowerCase() === normalizedPlayer
  );
}

/**
 * Validate that all selected cells form a connected group AND
 * that group is adjacent to the player's existing territory.
 * For players with no existing territory, validates that selected cells
 * form a connected group among themselves.
 */
export function areAllConnected(
  grid: GridState,
  playerAddress: string,
  selectedCellIds: number[]
): boolean {
  if (selectedCellIds.length === 0) return false;
  if (selectedCellIds.length === 1) {
    return isConnected(grid, playerAddress, selectedCellIds[0]);
  }

  const normalizedPlayer = playerAddress.toLowerCase();
  const selectedSet = new Set(selectedCellIds);

  // 1. Check that selected cells form a connected component among themselves
  const visited = new Set<number>();
  const queue: number[] = [selectedCellIds[0]];
  visited.add(selectedCellIds[0]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const neighbor of getAdjacentCells(current)) {
      if (selectedSet.has(neighbor) && !visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }

  // All selected cells must be reachable from the first one
  if (visited.size !== selectedSet.size) return false;

  // 2. Check adjacency to existing territory
  const playerOwnsAny = grid.owners.some(
    (owner) => owner.toLowerCase() === normalizedPlayer
  );

  // First territory claim - just need internal connectivity (already checked)
  if (!playerOwnsAny) return true;

  // At least one selected cell must be adjacent to player's existing territory
  for (const cellId of selectedCellIds) {
    for (const neighbor of getAdjacentCells(cellId)) {
      if (
        !selectedSet.has(neighbor) &&
        grid.owners[neighbor]?.toLowerCase() === normalizedPlayer
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Get all cells in the player's connected territory (largest connected component)
 */
export function getConnectedComponent(
  grid: GridState,
  playerAddress: string
): Set<number> {
  const normalizedPlayer = playerAddress.toLowerCase();
  const playerCells = grid.owners
    .map((owner, i) => ({ owner: owner.toLowerCase(), i }))
    .filter((c) => c.owner === normalizedPlayer)
    .map((c) => c.i);

  if (playerCells.length === 0) return new Set();

  // Find largest connected component via BFS
  const allVisited = new Set<number>();
  let largestComponent = new Set<number>();
  const playerCellSet = new Set(playerCells);

  for (const startCell of playerCells) {
    if (allVisited.has(startCell)) continue;

    const component = new Set<number>();
    const queue = [startCell];
    component.add(startCell);

    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const neighbor of getAdjacentCells(current)) {
        if (playerCellSet.has(neighbor) && !component.has(neighbor)) {
          component.add(neighbor);
          queue.push(neighbor);
        }
      }
    }

    component.forEach((c) => allVisited.add(c));
    if (component.size > largestComponent.size) {
      largestComponent = component;
    }
  }

  return largestComponent;
}

/**
 * Generate deterministic color from address
 */
export function addressToColor(address: string): string {
  if (!address || address === "0x0000000000000000000000000000000000000000") return "#e5e7eb";
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}
