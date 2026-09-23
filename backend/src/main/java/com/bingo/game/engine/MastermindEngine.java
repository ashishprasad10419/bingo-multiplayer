package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.util.*;

@Component
public class MastermindEngine {

    public static final int CODE_LENGTH = 4;
    public static final int MAX_ATTEMPTS = 8;

    public static final List<String> VALID_COLORS = List.of(
            "RED",
            "BLUE",
            "GREEN",
            "YELLOW",
            "PURPLE",
            "ORANGE"
    );

    private final SecureRandom random = new SecureRandom();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Evaluation {
        private int exactMatches; // Black pegs: right color, right position
        private int colorMatches; // White pegs: right color, wrong position
        private boolean win;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MastermindGuessRecord {
        private String userId;
        private List<String> guess;
        private int exactMatches;
        private int colorMatches;
        private long timestamp;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TurnResult {
        private boolean valid;
        private String message;
        private Evaluation evaluation;
        private MastermindGuessRecord guessRecord;
        private boolean isGameOver;
        private String winnerId;
        private boolean isDraw;
        private String nextTurnUserId;
    }

    public boolean isValidCode(List<String> code) {
        if (code == null || code.size() != CODE_LENGTH) {
            return false;
        }
        for (String c : code) {
            if (c == null || !VALID_COLORS.contains(c.toUpperCase())) {
                return false;
            }
        }
        return true;
    }

    public List<String> generateRandomCode() {
        List<String> code = new ArrayList<>(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.add(VALID_COLORS.get(random.nextInt(VALID_COLORS.size())));
        }
        return code;
    }

    public Evaluation evaluateGuess(List<String> secret, List<String> guess) {
        if (secret == null || guess == null || secret.size() != CODE_LENGTH || guess.size() != CODE_LENGTH) {
            return new Evaluation(0, 0, false);
        }

        int exact = 0;
        boolean[] secretMatched = new boolean[CODE_LENGTH];
        boolean[] guessMatched = new boolean[CODE_LENGTH];

        // Pass 1: exact matches (position and color)
        for (int i = 0; i < CODE_LENGTH; i++) {
            if (secret.get(i).equalsIgnoreCase(guess.get(i))) {
                exact++;
                secretMatched[i] = true;
                guessMatched[i] = true;
            }
        }

        // Pass 2: color matches (right color, wrong position)
        int colorMatches = 0;
        for (int g = 0; g < CODE_LENGTH; g++) {
            if (guessMatched[g]) continue;
            for (int s = 0; s < CODE_LENGTH; s++) {
                if (!secretMatched[s] && guess.get(g).equalsIgnoreCase(secret.get(s))) {
                    colorMatches++;
                    secretMatched[s] = true;
                    break;
                }
            }
        }

        boolean isWin = (exact == CODE_LENGTH);
        return new Evaluation(exact, colorMatches, isWin);
    }
}
