package com.bingo.game;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class GameEngineTest {

    private GameEngine gameEngine;

    @BeforeEach
    void setUp() {
        gameEngine = new GameEngine();
    }

    @Test
    void testGenerateRandomBoard() {
        List<List<Integer>> board = gameEngine.generateRandomBoard(5);
        assertNotNull(board);
        assertEquals(5, board.size());

        Set<Integer> unique = new HashSet<>();
        for (List<Integer> row : board) {
            assertEquals(5, row.size());
            for (Integer num : row) {
                assertTrue(num >= 1 && num <= 25);
                unique.add(num);
            }
        }
        assertEquals(25, unique.size());
        assertTrue(gameEngine.validateBoard(board, 5));
    }

    @Test
    void testValidateBoardWithDuplicatesOrMissing() {
        List<List<Integer>> invalidBoard = List.of(
                List.of(1, 2, 3, 4, 5),
                List.of(6, 7, 8, 9, 10),
                List.of(11, 12, 13, 14, 15),
                List.of(16, 17, 18, 19, 20),
                List.of(21, 22, 23, 24, 24) // duplicate 24 instead of 25
        );
        assertFalse(gameEngine.validateBoard(invalidBoard, 5));
    }

    @Test
    void testSwapCells() {
        List<List<Integer>> board = List.of(
                List.of(1, 2, 3, 4, 5),
                List.of(6, 7, 8, 9, 10),
                List.of(11, 12, 13, 14, 15),
                List.of(16, 17, 18, 19, 20),
                List.of(21, 22, 23, 24, 25)
        );

        List<List<Integer>> swapped = gameEngine.swapCells(board, 0, 0, 4, 4, 5);
        assertEquals(25, swapped.get(0).get(0));
        assertEquals(1, swapped.get(4).get(4));
    }

    @Test
    void testCalculateLineCountRowsColumnsAndDiagonals() {
        // Standard ordered 5x5 board
        List<List<Integer>> board = List.of(
                List.of(1,  2,  3,  4,  5),
                List.of(6,  7,  8,  9,  10),
                List.of(11, 12, 13, 14, 15),
                List.of(16, 17, 18, 19, 20),
                List.of(21, 22, 23, 24, 25)
        );

        // Call row 1: 1, 2, 3, 4, 5 -> 1 line
        Set<Integer> called = new HashSet<>(Set.of(1, 2, 3, 4, 5));
        assertEquals(1, gameEngine.calculateLineCount(board, called, 5));

        // Also call column 1: 1, 6, 11, 16, 21 -> row 1 + col 1 = 2 lines
        called.addAll(Set.of(6, 11, 16, 21));
        assertEquals(2, gameEngine.calculateLineCount(board, called, 5));

        // Also call diagonal 1 (1, 7, 13, 19, 25)
        called.addAll(Set.of(7, 13, 19, 25));
        assertEquals(3, gameEngine.calculateLineCount(board, called, 5));

        // Also call diagonal 2 (5, 9, 13, 17, 21)
        called.addAll(Set.of(9, 17));
        assertEquals(4, gameEngine.calculateLineCount(board, called, 5));

        // Also call row 2 (6, 7, 8, 9, 10)
        called.addAll(Set.of(8, 10));
        assertEquals(5, gameEngine.calculateLineCount(board, called, 5));

        // Winner check
        assertTrue(gameEngine.checkWinner(5, 5));
        assertFalse(gameEngine.checkWinner(4, 5));
    }
}
