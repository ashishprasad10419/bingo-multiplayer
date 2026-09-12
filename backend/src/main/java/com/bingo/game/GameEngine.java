package com.bingo.game;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class GameEngine {

    public static final int DEFAULT_BOARD_SIZE = 5;
    public static final int DEFAULT_WINNING_LINES = 5;

    /**
     * Generates a randomized 5x5 board containing numbers 1 to 25.
     */
    public List<List<Integer>> generateRandomBoard(int boardSize) {
        int totalCells = boardSize * boardSize;
        List<Integer> numbers = new ArrayList<>(totalCells);
        for (int i = 1; i <= totalCells; i++) {
            numbers.add(i);
        }
        Collections.shuffle(numbers);

        List<List<Integer>> grid = new ArrayList<>(boardSize);
        for (int r = 0; r < boardSize; r++) {
            List<Integer> row = new ArrayList<>(boardSize);
            for (int c = 0; c < boardSize; c++) {
                row.add(numbers.get(r * boardSize + c));
            }
            grid.add(row);
        }
        return grid;
    }

    /**
     * Validates whether a board is valid: exactly size x size, all values 1..totalCells present with no duplicates.
     */
    public boolean validateBoard(List<List<Integer>> board, int boardSize) {
        if (board == null || board.size() != boardSize) {
            return false;
        }

        int totalCells = boardSize * boardSize;
        Set<Integer> seen = new HashSet<>();

        for (List<Integer> row : board) {
            if (row == null || row.size() != boardSize) {
                return false;
            }
            for (Integer val : row) {
                if (val == null || val < 1 || val > totalCells) {
                    return false;
                }
                if (!seen.add(val)) {
                    return false; // duplicate found
                }
            }
        }

        return seen.size() == totalCells;
    }

    /**
     * Swaps two cells in a board grid.
     */
    public List<List<Integer>> swapCells(List<List<Integer>> board, int r1, int c1, int r2, int c2, int boardSize) {
        if (board == null || board.size() != boardSize) {
            throw new IllegalArgumentException("Invalid board structure");
        }
        if (r1 < 0 || r1 >= boardSize || c1 < 0 || c1 >= boardSize ||
            r2 < 0 || r2 >= boardSize || c2 < 0 || c2 >= boardSize) {
            throw new IllegalArgumentException("Cell coordinates out of bounds");
        }

        // Deep copy board to maintain immutability
        List<List<Integer>> newBoard = new ArrayList<>(boardSize);
        for (List<Integer> row : board) {
            newBoard.add(new ArrayList<>(row));
        }

        int temp = newBoard.get(r1).get(c1);
        newBoard.get(r1).set(c1, newBoard.get(r2).get(c2));
        newBoard.get(r2).set(c2, temp);

        return newBoard;
    }

    /**
     * Calculates the completed line count for a given board against called numbers.
     * Evaluates 5 rows, 5 columns, and 2 diagonals (12 possible lines).
     */
    public int calculateLineCount(List<List<Integer>> board, Collection<Integer> calledNumbers, int boardSize) {
        if (board == null || calledNumbers == null || board.size() != boardSize) {
            return 0;
        }

        Set<Integer> calledSet = new HashSet<>(calledNumbers);
        int completedLines = 0;

        // 1. Check rows
        for (int r = 0; r < boardSize; r++) {
            boolean rowComplete = true;
            for (int c = 0; c < boardSize; c++) {
                if (!calledSet.contains(board.get(r).get(c))) {
                    rowComplete = false;
                    break;
                }
            }
            if (rowComplete) {
                completedLines++;
            }
        }

        // 2. Check columns
        for (int c = 0; c < boardSize; c++) {
            boolean colComplete = true;
            for (int r = 0; r < boardSize; r++) {
                if (!calledSet.contains(board.get(r).get(c))) {
                    colComplete = false;
                    break;
                }
            }
            if (colComplete) {
                completedLines++;
            }
        }

        // 3. Diagonal 1: Top-left to bottom-right
        boolean diag1Complete = true;
        for (int i = 0; i < boardSize; i++) {
            if (!calledSet.contains(board.get(i).get(i))) {
                diag1Complete = false;
                break;
            }
        }
        if (diag1Complete) {
            completedLines++;
        }

        // 4. Diagonal 2: Top-right to bottom-left
        boolean diag2Complete = true;
        for (int i = 0; i < boardSize; i++) {
            if (!calledSet.contains(board.get(i).get(boardSize - 1 - i))) {
                diag2Complete = false;
                break;
            }
        }
        if (diag2Complete) {
            completedLines++;
        }

        return completedLines;
    }

    /**
     * Checks if a player has achieved the winning condition (lineCount >= winningLines).
     */
    public boolean checkWinner(int lineCount, int winningLines) {
        return lineCount >= winningLines;
    }

    /**
     * Checks if all numbers on a board have been called (Blackout / Full House mode).
     */
    public boolean isBlackout(List<List<Integer>> board, Collection<Integer> calledNumbers) {
        if (board == null || calledNumbers == null || board.isEmpty()) {
            return false;
        }
        Set<Integer> calledSet = new HashSet<>(calledNumbers);
        for (List<Integer> row : board) {
            for (Integer num : row) {
                if (!calledSet.contains(num)) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Gets the next turn player index using round-robin.
     */
    public int getNextPlayerIndex(int currentIndex, int totalPlayers) {
        if (totalPlayers <= 0) return 0;
        return (currentIndex + 1) % totalPlayers;
    }
}
