package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class MemoryEngine {

    public static final List<String> CARD_SYMBOLS = List.of(
            "GEM", "ROCKET", "FIRE", "STAR", "HEART", "LIGHTNING", "CROWN", "SHIELD"
    );

    public enum Status {
        FIRST_CARD_FLIPPED,
        MATCH,
        MISMATCH
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FlipResult {
        private Status status;
        private int firstIndex;
        private int secondIndex;
        private String firstSymbol;
        private String secondSymbol;
        private boolean match;
        private boolean allMatched;
        private boolean extraTurn;
    }

    public List<String> initializeDeck() {
        List<String> deck = new ArrayList<>();
        for (String sym : CARD_SYMBOLS) {
            deck.add(sym);
            deck.add(sym);
        }
        Collections.shuffle(deck);
        return deck;
    }

    public FlipResult processFlip(
            List<String> cards,
            List<Boolean> matched,
            List<Integer> flippedIndices,
            int cardIndex,
            String userId,
            Map<String, Integer> playerScores
    ) {
        if (cardIndex < 0 || cardIndex >= cards.size()) {
            throw new IllegalArgumentException("Card index " + cardIndex + " out of bounds");
        }
        if (matched.get(cardIndex)) {
            throw new IllegalStateException("Card at " + cardIndex + " is already matched");
        }
        if (flippedIndices.contains(cardIndex)) {
            throw new IllegalStateException("Card at " + cardIndex + " is already flipped");
        }

        if (flippedIndices.isEmpty()) {
            flippedIndices.add(cardIndex);
            return FlipResult.builder()
                    .status(Status.FIRST_CARD_FLIPPED)
                    .firstIndex(cardIndex)
                    .firstSymbol(cards.get(cardIndex))
                    .match(false)
                    .extraTurn(true)
                    .allMatched(false)
                    .build();
        }

        // Second card flipped
        int firstIndex = flippedIndices.get(0);
        int secondIndex = cardIndex;
        String sym1 = cards.get(firstIndex);
        String sym2 = cards.get(secondIndex);

        boolean isMatch = sym1.equals(sym2);

        if (isMatch) {
            matched.set(firstIndex, true);
            matched.set(secondIndex, true);
            flippedIndices.clear();

            int score = playerScores.getOrDefault(userId, 0);
            playerScores.put(userId, score + 1);

            boolean allDone = matched.stream().allMatch(b -> b);

            return FlipResult.builder()
                    .status(Status.MATCH)
                    .firstIndex(firstIndex)
                    .secondIndex(secondIndex)
                    .firstSymbol(sym1)
                    .secondSymbol(sym2)
                    .match(true)
                    .allMatched(allDone)
                    .extraTurn(true) // match grants bonus turn
                    .build();
        } else {
            // Mismatch: keep flippedIndices temporarily so both cards are shown to players
            flippedIndices.clear();
            return FlipResult.builder()
                    .status(Status.MISMATCH)
                    .firstIndex(firstIndex)
                    .secondIndex(secondIndex)
                    .firstSymbol(sym1)
                    .secondSymbol(sym2)
                    .match(false)
                    .allMatched(false)
                    .extraTurn(false)
                    .build();
        }
    }
}
