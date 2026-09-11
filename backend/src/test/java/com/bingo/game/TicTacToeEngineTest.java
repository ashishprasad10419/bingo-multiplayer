package com.bingo.game;

import com.bingo.game.engine.TicTacToeEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class TicTacToeEngineTest {

    private TicTacToeEngine engine;

    @BeforeEach
    void setUp() {
        engine = new TicTacToeEngine();
    }

    @Test
    void testInitializeBoard() {
        List<String> board = engine.initializeBoard(3);
        assertEquals(9, board.size());
        for (String cell : board) {
            assertEquals("", cell);
        }
    }

    @Test
    void testRowWin() {
        List<String> board = engine.initializeBoard(3);
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 0, "p1"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 1, 0, "p2"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 1, "p1"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 1, 1, "p2"));
        assertEquals(TicTacToeEngine.Result.WIN, engine.processMove(board, 3, 0, 2, "p1"));
    }

    @Test
    void testDiagonalWin() {
        List<String> board = engine.initializeBoard(3);
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 0, "p1"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 1, "p2"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 1, 1, "p1"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 2, "p2"));
        assertEquals(TicTacToeEngine.Result.WIN, engine.processMove(board, 3, 2, 2, "p1"));
    }

    @Test
    void testAntiDiagonalWin() {
        List<String> board = engine.initializeBoard(3);
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 2, "p1"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 0, "p2"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 1, 1, "p1"));
        assertEquals(TicTacToeEngine.Result.CONTINUE, engine.processMove(board, 3, 0, 1, "p2"));
        assertEquals(TicTacToeEngine.Result.WIN, engine.processMove(board, 3, 2, 0, "p1"));
    }

    @Test
    void testCellAlreadyOccupiedThrows() {
        List<String> board = engine.initializeBoard(3);
        engine.processMove(board, 3, 1, 1, "p1");
        assertThrows(IllegalStateException.class, () -> engine.processMove(board, 3, 1, 1, "p2"));
    }

    @Test
    void testDrawGame() {
        List<String> board = engine.initializeBoard(3);
        // X O X
        // X X O
        // O X O
        engine.processMove(board, 3, 0, 0, "X");
        engine.processMove(board, 3, 0, 1, "O");
        engine.processMove(board, 3, 0, 2, "X");

        engine.processMove(board, 3, 1, 0, "X");
        engine.processMove(board, 3, 1, 2, "O");
        engine.processMove(board, 3, 1, 1, "X");

        engine.processMove(board, 3, 2, 0, "O");
        engine.processMove(board, 3, 2, 2, "O");
        TicTacToeEngine.Result lastMove = engine.processMove(board, 3, 2, 1, "X");

        assertEquals(TicTacToeEngine.Result.DRAW, lastMove);
    }
}
