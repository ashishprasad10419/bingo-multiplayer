package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Component
public class ConnectFourEngine {

    public static final int DEFAULT_COLS = 7;
    public static final int DEFAULT_ROWS = 6;

    public enum Status {
        CONTINUE,
        WIN,
        DRAW
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MoveResult {
        private Status status;
        private int row;
        private int col;
        private List<Integer> winningCells;
    }

    public List<String> initializeBoard(int cols, int rows) {
        return new ArrayList<>(Collections.nCopies(cols * rows, ""));
    }

    public MoveResult dropChip(List<String> board, int cols, int rows, int col, String userId) {
        if (col < 0 || col >= cols) {
            throw new IllegalArgumentException("Column " + col + " out of bounds [0.." + (cols - 1) + "]");
        }

        // Drop chip from bottom row (rows - 1) up to top row (0)
        int targetRow = -1;
        for (int r = rows - 1; r >= 0; r--) {
            int idx = r * cols + col;
            String cellVal = board.get(idx);
            if (cellVal == null || cellVal.isEmpty()) {
                targetRow = r;
                break;
            }
        }

        if (targetRow == -1) {
            throw new IllegalStateException("Column " + col + " is already full");
        }

        int targetIndex = targetRow * cols + col;
        board.set(targetIndex, userId);

        // Check for 4-in-a-row
        List<Integer> winningCells = checkWin(board, cols, rows, targetRow, col, userId);
        if (winningCells != null && winningCells.size() >= 4) {
            return MoveResult.builder()
                    .status(Status.WIN)
                    .row(targetRow)
                    .col(col)
                    .winningCells(winningCells)
                    .build();
        }

        // Check if board is full (draw)
        boolean hasEmpty = false;
        for (String cell : board) {
            if (cell == null || cell.isEmpty()) {
                hasEmpty = true;
                break;
            }
        }

        return MoveResult.builder()
                .status(hasEmpty ? Status.CONTINUE : Status.DRAW)
                .row(targetRow)
                .col(col)
                .winningCells(Collections.emptyList())
                .build();
    }

    private List<Integer> checkWin(List<String> board, int cols, int rows, int r, int c, String userId) {
        int[][] directions = {
                {0, 1},   // Horizontal
                {1, 0},   // Vertical
                {1, 1},   // Diagonal \
                {1, -1}   // Diagonal /
        };

        for (int[] dir : directions) {
            List<Integer> line = new ArrayList<>();
            line.add(r * cols + c);

            // Forward
            int step = 1;
            while (true) {
                int nr = r + dir[0] * step;
                int nc = c + dir[1] * step;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
                if (userId.equals(board.get(nr * cols + nc))) {
                    line.add(nr * cols + nc);
                    step++;
                } else {
                    break;
                }
            }

            // Backward
            step = 1;
            while (true) {
                int nr = r - dir[0] * step;
                int nc = c - dir[1] * step;
                if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) break;
                if (userId.equals(board.get(nr * cols + nc))) {
                    line.add(nr * cols + nc);
                    step++;
                } else {
                    break;
                }
            }

            if (line.size() >= 4) {
                return line;
            }
        }

        return null;
    }
}
