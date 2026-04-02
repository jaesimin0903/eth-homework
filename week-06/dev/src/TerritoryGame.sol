// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

/// @title TerritoryGame - ETH-based 10x10 grid territory conquest game
/// @notice Players pay ETH to claim connected cells and can takeover others' cells by paying more
contract TerritoryGame {
    uint8 public constant GRID_SIZE = 10;
    uint8 public constant TOTAL_CELLS = 100;
    uint256 public constant BASE_PRICE = 0.001 ether;
    uint256 public constant REFUND_RATE = 80;

    struct Cell {
        address owner;
        uint256 price;
    }

    mapping(uint8 => Cell) public cells;
    mapping(address => uint256) public playerTotalPaid;
    mapping(address => uint8) public playerCellCount;
    mapping(address => uint256) public pendingWithdrawals;

    uint256 public accumulatedFees;
    address public owner;

    event CellClaimed(
        uint8 indexed cellId, address indexed newOwner, address indexed previousOwner, uint256 price
    );
    event RefundAvailable(address indexed player, uint256 amount);
    event RefundWithdrawn(address indexed player, uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /// @notice Claim multiple cells in one atomic transaction (primary function)
    function claimCells(uint8[] calldata cellIds) external payable {
        uint256 len = cellIds.length;
        require(len > 0 && len <= TOTAL_CELLS, "Invalid cell count");

        uint256 pricePerCell = msg.value / len;
        uint256 dust = msg.value % len;
        if (dust > 0) {
            accumulatedFees += dust;
        }

        bool[100] memory seen;

        for (uint256 i = 0; i < len; i++) {
            _processCell(cellIds[i], pricePerCell, seen);
        }
    }

    /// @notice Claim a single cell (convenience wrapper)
    function claimCell(uint8 cellId) external payable {
        bool[100] memory seen;
        _processCell(cellId, msg.value, seen);
    }

    function _processCell(uint8 cellId, uint256 pricePerCell, bool[100] memory seen) internal {
        require(cellId < TOTAL_CELLS, "Invalid cell ID");
        require(!seen[cellId], "Duplicate cell ID");
        seen[cellId] = true;

        Cell storage cell = cells[cellId];
        address previousOwner = cell.owner;

        if (previousOwner == address(0)) {
            require(pricePerCell >= BASE_PRICE, "Below base price");

            cell.owner = msg.sender;
            cell.price = pricePerCell;
            playerTotalPaid[msg.sender] += pricePerCell;
            playerCellCount[msg.sender] += 1;
        } else {
            require(previousOwner != msg.sender, "Cannot takeover own cell");
            require(pricePerCell > cell.price, "Price too low for takeover");

            uint256 oldPrice = cell.price;
            uint256 refund = oldPrice * REFUND_RATE / 100;
            uint256 fee = oldPrice - refund;

            pendingWithdrawals[previousOwner] += refund;
            accumulatedFees += fee;

            playerTotalPaid[previousOwner] -= oldPrice;
            playerCellCount[previousOwner] -= 1;

            cell.owner = msg.sender;
            cell.price = pricePerCell;
            playerTotalPaid[msg.sender] += pricePerCell;
            playerCellCount[msg.sender] += 1;

            emit RefundAvailable(previousOwner, refund);
        }

        emit CellClaimed(cellId, msg.sender, previousOwner, pricePerCell);
    }

    /// @notice Withdraw pending refunds (pull pattern, CEI)
    function withdraw() external {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");

        pendingWithdrawals[msg.sender] = 0;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit RefundWithdrawn(msg.sender, amount);
    }

    /// @notice Withdraw accumulated fees (owner only)
    function withdrawFees() external onlyOwner {
        uint256 amount = accumulatedFees;
        require(amount > 0, "No fees to withdraw");

        accumulatedFees = 0;

        (bool success,) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");

        emit FeesWithdrawn(msg.sender, amount);
    }

    /// @notice Get cell info
    function getCell(uint8 cellId) external view returns (address, uint256) {
        require(cellId < TOTAL_CELLS, "Invalid cell ID");
        Cell storage cell = cells[cellId];
        return (cell.owner, cell.price);
    }

    /// @notice Get cell price (returns BASE_PRICE for empty cells)
    function getCellPrice(uint8 cellId) external view returns (uint256) {
        require(cellId < TOTAL_CELLS, "Invalid cell ID");
        if (cells[cellId].owner == address(0)) {
            return BASE_PRICE;
        }
        return cells[cellId].price;
    }

    /// @notice Get player statistics
    function getPlayerStats(address player)
        external
        view
        returns (uint8 cellCount, uint256 totalPaid, uint256 avgPrice)
    {
        cellCount = playerCellCount[player];
        totalPaid = playerTotalPaid[player];
        avgPrice = cellCount > 0 ? totalPaid / cellCount : 0;
    }

    /// @notice Get full grid state in one call
    function getFullGrid()
        external
        view
        returns (address[100] memory owners, uint256[100] memory prices)
    {
        for (uint8 i = 0; i < TOTAL_CELLS; i++) {
            owners[i] = cells[i].owner;
            prices[i] = cells[i].price;
        }
    }
}
