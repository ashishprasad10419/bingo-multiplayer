package com.bingo.game.engine;

import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class DotsAndBoxesEngine {

    public static class MoveResult {
        private final int boxesCompleted;
        private final boolean gameFinished;
        private final String winnerId;
        private final boolean isDraw;

        public MoveResult(int boxesCompleted, boolean gameFinished, String winnerId, boolean isDraw) {
            this.boxesCompleted = boxesCompleted;
            this.gameFinished = gameFinished;
            this.winnerId = winnerId;
            this.isDraw = isDraw;
        }

        public int getBoxesCompleted() { return boxesCompleted; }
        public boolean isGameFinished() { return gameFinished; }
        public String getWinnerId() { return winnerId; }
        public boolean isDraw() { return isDraw; }
        public boolean givesExtraTurn() { return boxesCompleted > 0 && !gameFinished; }
    }

    public MoveResult drawLine(
            int dotsGridSize,
            String lineType, // "H" or "V"
            int row,
            int col,
            String userId,
            List<String> horizontalLines,
            List<String> verticalLines,
            Map<String, String> completedBoxes,
            Map<String, Integer> playerScores
    ) {
        String key = row + "-" + col;
        int boxRows = dotsGridSize - 1;
        int boxCols = dotsGridSize - 1;
        int totalBoxes = boxRows * boxCols;

        if ("H".equalsIgnoreCase(lineType)) {
            if (row < 0 || row >= dotsGridSize || col < 0 || col >= boxCols) {
                throw new IllegalArgumentException("Horizontal line coordinates out of bounds");
            }
            if (horizontalLines.contains(key)) {
                throw new IllegalStateException("Horizontal line already drawn");
            }
            horizontalLines.add(key);
        } else if ("V".equalsIgnoreCase(lineType)) {
            if (row < 0 || row >= boxRows || col < 0 || col >= dotsGridSize) {
                throw new IllegalArgumentException("Vertical line coordinates out of bounds");
            }
            if (verticalLines.contains(key)) {
                throw new IllegalStateException("Vertical line already drawn");
            }
            verticalLines.add(key);
        } else {
            throw new IllegalArgumentException("Invalid line type: " + lineType);
        }

        // Check for newly completed boxes
        int newlyCompleted = 0;
        for (int br = 0; br < boxRows; br++) {
            for (int bc = 0; bc < boxCols; bc++) {
                String boxKey = br + "-" + bc;
                if (!completedBoxes.containsKey(boxKey)) {
                    boolean top = horizontalLines.contains(br + "-" + bc);
                    boolean bottom = horizontalLines.contains((br + 1) + "-" + bc);
                    boolean left = verticalLines.contains(br + "-" + bc);
                    boolean right = verticalLines.contains(br + "-" + (bc + 1));

                    if (top && bottom && left && right) {
                        completedBoxes.put(boxKey, userId);
                        newlyCompleted++;
                    }
                }
            }
        }

        if (newlyCompleted > 0) {
            int currentScore = playerScores.getOrDefault(userId, 0);
            playerScores.put(userId, currentScore + newlyCompleted);
        }

        boolean finished = completedBoxes.size() >= totalBoxes;
        String winnerId = null;
        boolean isDraw = false;

        if (finished) {
            int maxScore = -1;
            for (Map.Entry<String, Integer> entry : playerScores.entrySet()) {
                int s = entry.getValue();
                if (s > maxScore) {
                    maxScore = s;
                    winnerId = entry.getKey();
                    isDraw = false;
                } else if (s == maxScore) {
                    isDraw = true;
                }
            }
            if (isDraw) {
                winnerId = null;
            }
        }

        return new MoveResult(newlyCompleted, finished, winnerId, isDraw);
    }
}
