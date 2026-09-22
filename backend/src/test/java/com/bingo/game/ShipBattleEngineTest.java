package com.bingo.game;

import com.bingo.game.engine.ShipBattleEngine;
import com.bingo.game.engine.ShipBattleEngine.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class ShipBattleEngineTest {

    private ShipBattleEngine engine;

    @BeforeEach
    void setUp() {
        engine = new ShipBattleEngine();
    }

    private List<ShipPlacement> createStandardFleet() {
        List<ShipPlacement> fleet = new ArrayList<>();
        // Carrier (5): (0,0) to (0,4)
        fleet.add(ShipPlacement.builder()
                .shipType("CARRIER")
                .row(0).col(0).orientation("HORIZONTAL")
                .cells(engine.computeShipCells("CARRIER", 0, 0, "HORIZONTAL"))
                .build());
        // Battleship (4): (2,0) to (2,3)
        fleet.add(ShipPlacement.builder()
                .shipType("BATTLESHIP")
                .row(2).col(0).orientation("HORIZONTAL")
                .cells(engine.computeShipCells("BATTLESHIP", 2, 0, "HORIZONTAL"))
                .build());
        // Cruiser (3): (4,0) to (4,2)
        fleet.add(ShipPlacement.builder()
                .shipType("CRUISER")
                .row(4).col(0).orientation("HORIZONTAL")
                .cells(engine.computeShipCells("CRUISER", 4, 0, "HORIZONTAL"))
                .build());
        // Submarine (3): (5,0) to (5,2)
        fleet.add(ShipPlacement.builder()
                .shipType("SUBMARINE")
                .row(5).col(0).orientation("HORIZONTAL")
                .cells(engine.computeShipCells("SUBMARINE", 5, 0, "HORIZONTAL"))
                .build());
        // Destroyer (2): (6,0) to (6,1)
        fleet.add(ShipPlacement.builder()
                .shipType("DESTROYER")
                .row(6).col(0).orientation("HORIZONTAL")
                .cells(engine.computeShipCells("DESTROYER", 6, 0, "HORIZONTAL"))
                .build());
        return fleet;
    }

    @Test
    void testValidateFleetSuccess() {
        List<ShipPlacement> fleet = createStandardFleet();
        assertDoesNotThrow(() -> engine.validateFleet(fleet));
    }

    @Test
    void testValidateFleetFailsOnOverlap() {
        List<ShipPlacement> fleet = createStandardFleet();
        // Move Battleship to overlap with Carrier at (0, 2)
        fleet.get(1).setRow(0);
        fleet.get(1).setCol(2);
        fleet.get(1).setCells(engine.computeShipCells("BATTLESHIP", 0, 2, "HORIZONTAL"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> engine.validateFleet(fleet));
        assertTrue(ex.getMessage().contains("Overlapping"));
    }

    @Test
    void testValidateFleetFailsOutOfBounds() {
        List<ShipPlacement> fleet = createStandardFleet();
        // Carrier placed at col 7 with length 5 (extends to col 11, out of 0..9)
        fleet.get(0).setCol(7);
        fleet.get(0).setCells(engine.computeShipCells("CARRIER", 0, 7, "HORIZONTAL"));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> engine.validateFleet(fleet));
        assertTrue(ex.getMessage().contains("outside the 7x7 board"));
    }

    @Test
    void testValidateFleetFailsMissingOrDuplicateShip() {
        List<ShipPlacement> fleet = createStandardFleet();
        // Duplicate Destroyer instead of Carrier
        fleet.set(0, ShipPlacement.builder()
                .shipType("DESTROYER")
                .row(0).col(0).orientation("HORIZONTAL")
                .cells(engine.computeShipCells("DESTROYER", 0, 0, "HORIZONTAL"))
                .build());

        assertThrows(IllegalArgumentException.class, () -> engine.validateFleet(fleet));
    }

    @Test
    void testGenerateRandomFleetIsValid() {
        for (int i = 0; i < 10; i++) {
            List<ShipPlacement> fleet = engine.generateRandomFleet();
            assertEquals(5, fleet.size());
            assertDoesNotThrow(() -> engine.validateFleet(fleet));
        }
    }

    @Test
    void testAttackMiss() {
        List<ShipPlacement> fleet = createStandardFleet();
        List<ShipAttack> pastAttacks = new ArrayList<>();

        // (1, 1) is open water
        AttackOutcome outcome = engine.processAttack(fleet, pastAttacks, 1, 1);
        assertEquals(AttackResultType.MISS, outcome.getResult());
        assertNull(outcome.getSunkShipType());
        assertFalse(outcome.isAllShipsSunk());
    }

    @Test
    void testAttackHitAndSink() {
        List<ShipPlacement> fleet = createStandardFleet();
        List<ShipAttack> pastAttacks = new ArrayList<>();

        // Destroyer is at (6,0) and (6,1)
        // Hit first segment
        AttackOutcome outcome1 = engine.processAttack(fleet, pastAttacks, 6, 0);
        assertEquals(AttackResultType.HIT, outcome1.getResult());
        assertNull(outcome1.getSunkShipType());
        assertFalse(outcome1.isAllShipsSunk());

        pastAttacks.add(ShipAttack.builder().attackerUserId("user1").row(6).col(0).result(AttackResultType.HIT).build());

        // Hit second segment -> Sunk!
        AttackOutcome outcome2 = engine.processAttack(fleet, pastAttacks, 6, 1);
        assertEquals(AttackResultType.SUNK, outcome2.getResult());
        assertEquals("DESTROYER", outcome2.getSunkShipType());
        assertFalse(outcome2.isAllShipsSunk());
    }

    @Test
    void testDuplicateAttackRejection() {
        List<ShipPlacement> fleet = createStandardFleet();
        List<ShipAttack> pastAttacks = new ArrayList<>();
        pastAttacks.add(ShipAttack.builder().attackerUserId("user1").row(6).col(0).result(AttackResultType.HIT).build());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                engine.processAttack(fleet, pastAttacks, 6, 0));
        assertTrue(ex.getMessage().contains("already been attacked"));
    }

    @Test
    void testWinConditionWhenAllShipsSunk() {
        List<ShipPlacement> fleet = createStandardFleet();
        List<ShipAttack> pastAttacks = new ArrayList<>();

        // Hit all segments of all ships
        for (ShipPlacement ship : fleet) {
            for (ShipCoordinate sc : ship.getCells()) {
                AttackOutcome outcome = engine.processAttack(fleet, pastAttacks, sc.getRow(), sc.getCol());
                pastAttacks.add(ShipAttack.builder()
                        .attackerUserId("user1")
                        .row(sc.getRow())
                        .col(sc.getCol())
                        .result(outcome.getResult())
                        .sunkShipType(outcome.getSunkShipType())
                        .build());
            }
        }

        assertEquals(17, pastAttacks.size());
        ShipAttack lastAttack = pastAttacks.get(pastAttacks.size() - 1);
        assertEquals(AttackResultType.SUNK, lastAttack.getResult());
    }
}
