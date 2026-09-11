package com.bingo.game.engine;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class TicTacToeEngine {

    public enum Result {
        CONTINUE,
        WIN,
        DRAW
    }

    public List<String> initializeBoard(int gridSize) {
        int totalCells = gridSize * gridSize;
        List<String> board = new ArrayList<>(Collections.nCopies(totalCells, ""));
        return board;
    }

    public Result processMove(List<String> board, int gridSize, int row, int col, String userId) {
        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
            throw new IllegalArgumentException("Move coordinates out of bounds");
        }

        int index = row * gridSize + col;
        if (index >= board.size()) {
            throw new IllegalArgumentException("Invalid cell index");
        }

        String currentVal = board.get(index);
        if (currentVal != null && !currentVal.isEmpty()) {
            throw new IllegalStateException("Cell is already occupied");
        }

        board.set(index, userId);

        if (checkWin(board, gridSize, row, col, userId)) {
            return Result.WIN;
        }

        boolean hasEmpty = false;
        for (String cell : board) {
            if (cell == null || cell.isEmpty()) {
                hasEmpty = true;
                break;
            }
        }

        return hasEmpty ? Result.CONTINUE : Result.DRAW;
    }

    private boolean checkWin(List<String> board, int gridSize, int row, int col, String userId) {
        // Check row
        boolean rowWin = true;
        for (int c = 0; c < gridSize; c++) {
            if (!userId.equals(board.get(row * gridSize + c))) {
                rowWin = false;
                break;
            }
        }
        if (rowWin) return true;

        // Check col
        boolean colWin = true;
        for (int r = 0; r < gridSize; r++) {
            if (!userId.equals(board.get(r * gridSize + col))) {
                colWin = false;
                break;
            }
        }
        if (colWin) return true;

        // Check main diagonal (if on diagonal)
        if (row == col) {
            boolean diagWin = true;
            for (int i = 0; i < gridSize; i++) {
                if (!userId.equals(board.get(i * gridSize + i))) {
                    diagWin = false;
                    break;
                }
            }
            if (diagWin) return true;
        }

        // Check anti-diagonal
        if (row + col == gridSize - 1) {
            boolean antiDiagWin = true;
            for (int i = 0; i < gridSize; i++) {
                if (!userId.equals(board.get(i * gridSize + (gridSize - 1 - i)))) {
                    antiDiagWin = false;
                    break;
                }
            }
            if (antiDiagWin) return true;
        }

        return false;
    }
}
