package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
public class RockPaperScissorsEngine {

    public static final String ROCK = "ROCK";
    public static final String PAPER = "PAPER";
    public static final String SCISSORS = "SCISSORS";

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoundResult {
        private boolean roundComplete;
        private String roundWinnerId; // null if tie
        private boolean isTie;
        private boolean isMatchWon;
        private String matchWinnerId;
        private String user1Choice;
        private String user2Choice;
    }

    public boolean isValidChoice(String choice) {
        if (choice == null) return false;
        String upper = choice.toUpperCase().trim();
        return ROCK.equals(upper) || PAPER.equals(upper) || SCISSORS.equals(upper);
    }

    public RoundResult evaluateRound(
            String user1Id,
            String user2Id,
            Map<String, String> choices,
            Map<String, Integer> currentScores,
            int targetWins
    ) {
        String c1 = choices.get(user1Id);
        String c2 = choices.get(user2Id);

        if (c1 == null || c2 == null) {
            return RoundResult.builder()
                    .roundComplete(false)
                    .build();
        }

        c1 = c1.toUpperCase();
        c2 = c2.toUpperCase();

        String roundWinner = null;
        boolean isTie = false;

        if (c1.equals(c2)) {
            isTie = true;
        } else if (
                (ROCK.equals(c1) && SCISSORS.equals(c2)) ||
                (SCISSORS.equals(c1) && PAPER.equals(c2)) ||
                (PAPER.equals(c1) && ROCK.equals(c2))
        ) {
            roundWinner = user1Id;
        } else {
            roundWinner = user2Id;
        }

        if (roundWinner != null) {
            int current = currentScores.getOrDefault(roundWinner, 0);
            currentScores.put(roundWinner, current + 1);
        }

        boolean matchWon = false;
        String matchWinner = null;
        if (roundWinner != null && currentScores.get(roundWinner) >= targetWins) {
            matchWon = true;
            matchWinner = roundWinner;
        }

        return RoundResult.builder()
                .roundComplete(true)
                .roundWinnerId(roundWinner)
                .isTie(isTie)
                .isMatchWon(matchWon)
                .matchWinnerId(matchWinner)
                .user1Choice(c1)
                .user2Choice(c2)
                .build();
    }
}
