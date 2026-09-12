package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class NumberRushEngine {

    public static final int TARGET_MAX_NUMBER = 25;

    public enum TapStatus {
        CORRECT,
        WRONG,
        FINISHED
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TapResult {
        private TapStatus status;
        private int tappedNumber;
        private int nextExpected;
        private boolean isWinner;
        private String winnerId;
    }

    public List<Integer> generateShuffledBoard() {
        List<Integer> list = new ArrayList<>();
        for (int i = 1; i <= TARGET_MAX_NUMBER; i++) {
            list.add(i);
        }
        Collections.shuffle(list);
        return list;
    }

    public TapResult processTap(String userId, int tappedNumber, Map<String, Integer> progress) {
        int expected = progress.getOrDefault(userId, 1);

        if (tappedNumber != expected) {
            return TapResult.builder()
                    .status(TapStatus.WRONG)
                    .tappedNumber(tappedNumber)
                    .nextExpected(expected)
                    .isWinner(false)
                    .build();
        }

        int next = expected + 1;
        progress.put(userId, next);

        if (next > TARGET_MAX_NUMBER) {
            return TapResult.builder()
                    .status(TapStatus.FINISHED)
                    .tappedNumber(tappedNumber)
                    .nextExpected(next)
                    .isWinner(true)
                    .winnerId(userId)
                    .build();
        }

        return TapResult.builder()
                .status(TapStatus.CORRECT)
                .tappedNumber(tappedNumber)
                .nextExpected(next)
                .isWinner(false)
                .build();
    }
}
