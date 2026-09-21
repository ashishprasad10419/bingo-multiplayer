package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class ShipBattleEngine {

    public static final int BOARD_SIZE = 10;
    public static final int TOTAL_SHIP_CELLS = 17; // 5 + 4 + 3 + 3 + 2

    public enum ShipType {
        CARRIER(5, "Aircraft Carrier"),
        BATTLESHIP(4, "Battleship"),
        CRUISER(3, "Cruiser"),
        SUBMARINE(3, "Submarine"),
        DESTROYER(2, "Destroyer");

        private final int size;
        private final String label;

        ShipType(int size, String label) {
            this.size = size;
            this.label = label;
        }

        public int getSize() {
            return size;
        }

        public String getLabel() {
            return label;
        }
    }

    public enum AttackResultType {
        MISS,
        HIT,
        SUNK
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShipPlacement {
        private String shipType; // e.g. "CARRIER"
        private int row;         // 0..9 (start row)
        private int col;         // 0..9 (start col)
        private String orientation; // "HORIZONTAL" or "VERTICAL"
        private List<ShipCoordinate> cells; // occupied cells
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShipCoordinate {
        private int row;
        private int col;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShipAttack {
        private String attackerUserId;
        private int row;
        private int col;
        private AttackResultType result;
        private String sunkShipType; // null if not sunk
        private long timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttackOutcome {
        private AttackResultType result;
        private String sunkShipType;
        private boolean allShipsSunk;
        private int totalHits;
    }

    /**
     * Normalizes and computes cell coordinates for a ship placement.
     */
    public List<ShipCoordinate> computeShipCells(String shipTypeStr, int startRow, int startCol, String orientation) {
        ShipType type = parseShipType(shipTypeStr);
        int size = type.getSize();
        boolean isHorizontal = "HORIZONTAL".equalsIgnoreCase(orientation);

        List<ShipCoordinate> cells = new ArrayList<>(size);
        for (int i = 0; i < size; i++) {
            int r = isHorizontal ? startRow : startRow + i;
            int c = isHorizontal ? startCol + i : startCol;
            cells.add(new ShipCoordinate(r, c));
        }
        return cells;
    }

    public ShipType parseShipType(String shipTypeStr) {
        if (shipTypeStr == null) {
            throw new IllegalArgumentException("Ship type cannot be null");
        }
        try {
            return ShipType.valueOf(shipTypeStr.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid ship type: " + shipTypeStr);
        }
    }

    /**
     * Validates a complete player fleet submission:
     * - Must contain exactly 5 ships corresponding to the 5 ShipType enum values
     * - Every cell must be within 0..9 bounds
     * - No two ships may occupy the same cell
     */
    public void validateFleet(List<ShipPlacement> fleet) {
        if (fleet == null || fleet.size() != ShipType.values().length) {
            throw new IllegalArgumentException("Fleet must contain exactly 5 ships (Carrier, Battleship, Cruiser, Submarine, Destroyer)");
        }

        Set<ShipType> requiredTypes = new HashSet<>(Arrays.asList(ShipType.values()));
        Set<String> occupiedCoordinates = new HashSet<>();

        for (ShipPlacement ship : fleet) {
            if (ship == null) {
                throw new IllegalArgumentException("Ship entry cannot be null");
            }

            ShipType type = parseShipType(ship.getShipType());
            if (!requiredTypes.remove(type)) {
                throw new IllegalArgumentException("Duplicate or extra ship type: " + ship.getShipType());
            }

            List<ShipCoordinate> cells = ship.getCells();
            if (cells == null || cells.isEmpty()) {
                cells = computeShipCells(ship.getShipType(), ship.getRow(), ship.getCol(), ship.getOrientation());
                ship.setCells(cells);
            }

            if (cells.size() != type.getSize()) {
                throw new IllegalArgumentException("Ship " + type.name() + " has invalid size " + cells.size() + ", expected " + type.getSize());
            }

            for (ShipCoordinate coord : cells) {
                if (coord.getRow() < 0 || coord.getRow() >= BOARD_SIZE ||
                    coord.getCol() < 0 || coord.getCol() >= BOARD_SIZE) {
                    throw new IllegalArgumentException("Ship cell (" + coord.getRow() + "," + coord.getCol() + ") is outside the 10x10 board bounds");
                }

                String key = coord.getRow() + "-" + coord.getCol();
                if (!occupiedCoordinates.add(key)) {
                    throw new IllegalArgumentException("Overlapping ships detected at (" + coord.getRow() + "," + coord.getCol() + ")");
                }
            }
        }

        if (!requiredTypes.isEmpty()) {
            throw new IllegalArgumentException("Fleet missing required ships: " + requiredTypes);
        }
    }

    /**
     * Generates a valid randomized 5-ship fleet.
     */
    public List<ShipPlacement> generateRandomFleet() {
        Random random = new Random();
        List<ShipPlacement> fleet = new ArrayList<>();
        Set<String> occupied = new HashSet<>();

        for (ShipType type : ShipType.values()) {
            boolean placed = false;
            int attempts = 0;
            while (!placed && attempts < 1000) {
                attempts++;
                boolean horizontal = random.nextBoolean();
                String orientation = horizontal ? "HORIZONTAL" : "VERTICAL";
                int startRow = horizontal ? random.nextInt(BOARD_SIZE) : random.nextInt(BOARD_SIZE - type.getSize() + 1);
                int startCol = horizontal ? random.nextInt(BOARD_SIZE - type.getSize() + 1) : random.nextInt(BOARD_SIZE);

                List<ShipCoordinate> cells = computeShipCells(type.name(), startRow, startCol, orientation);
                boolean collision = false;
                for (ShipCoordinate sc : cells) {
                    if (occupied.contains(sc.getRow() + "-" + sc.getCol())) {
                        collision = true;
                        break;
                    }
                }

                if (!collision) {
                    for (ShipCoordinate sc : cells) {
                        occupied.add(sc.getRow() + "-" + sc.getCol());
                    }
                    fleet.add(ShipPlacement.builder()
                            .shipType(type.name())
                            .row(startRow)
                            .col(startCol)
                            .orientation(orientation)
                            .cells(cells)
                            .build());
                    placed = true;
                }
            }
        }
        return fleet;
    }

    /**
     * Processes an attack against defender's fleet.
     */
    public AttackOutcome processAttack(List<ShipPlacement> defenderFleet, List<ShipAttack> previousAttacks, int row, int col) {
        if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
            throw new IllegalArgumentException("Attack coordinate (" + row + "," + col + ") out of bounds (0-9)");
        }

        // Check if cell was already attacked
        if (previousAttacks != null) {
            for (ShipAttack att : previousAttacks) {
                if (att.getRow() == row && att.getCol() == col) {
                    throw new IllegalArgumentException("Cell (" + row + "," + col + ") has already been attacked");
                }
            }
        }

        // Find if target cell hits any ship
        ShipPlacement hitShip = null;
        for (ShipPlacement ship : defenderFleet) {
            for (ShipCoordinate cell : ship.getCells()) {
                if (cell.getRow() == row && cell.getCol() == col) {
                    hitShip = ship;
                    break;
                }
            }
            if (hitShip != null) break;
        }

        if (hitShip == null) {
            // MISS
            return AttackOutcome.builder()
                    .result(AttackResultType.MISS)
                    .sunkShipType(null)
                    .allShipsSunk(false)
                    .totalHits(countTotalHits(previousAttacks))
                    .build();
        }

        // It is a HIT. Now check if this hit sinks the ship.
        Set<String> allAttackedHits = new HashSet<>();
        if (previousAttacks != null) {
            for (ShipAttack att : previousAttacks) {
                if (att.getResult() == AttackResultType.HIT || att.getResult() == AttackResultType.SUNK) {
                    allAttackedHits.add(att.getRow() + "-" + att.getCol());
                }
            }
        }
        allAttackedHits.add(row + "-" + col);

        boolean shipSunk = true;
        for (ShipCoordinate cell : hitShip.getCells()) {
            if (!allAttackedHits.contains(cell.getRow() + "-" + cell.getCol())) {
                shipSunk = false;
                break;
            }
        }

        int totalHits = allAttackedHits.size();
        boolean allSunk = (totalHits >= TOTAL_SHIP_CELLS) || defenderFleet.stream().allMatch(ship ->
                ship.getCells().stream().allMatch(cell -> allAttackedHits.contains(cell.getRow() + "-" + cell.getCol()))
        );

        return AttackOutcome.builder()
                .result(shipSunk ? AttackResultType.SUNK : AttackResultType.HIT)
                .sunkShipType(shipSunk ? hitShip.getShipType() : null)
                .allShipsSunk(allSunk)
                .totalHits(totalHits)
                .build();
    }

    private int countTotalHits(List<ShipAttack> previousAttacks) {
        if (previousAttacks == null) return 0;
        int count = 0;
        for (ShipAttack att : previousAttacks) {
            if (att.getResult() == AttackResultType.HIT || att.getResult() == AttackResultType.SUNK) {
                count++;
            }
        }
        return count;
    }
}
