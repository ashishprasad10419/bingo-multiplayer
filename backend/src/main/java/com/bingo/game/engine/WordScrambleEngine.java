package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class WordScrambleEngine {

    public static final int TOTAL_ROUNDS = 5;

    public record WordEntry(String word, String hint) {}

    private static final List<WordEntry> WORD_BANK = List.of(
            new WordEntry("PLANET", "A celestial body orbiting a star"),
            new WordEntry("DRAGON", "A legendary fire-breathing creature"),
            new WordEntry("GALAXY", "A vast cosmic system of millions of stars"),
            new WordEntry("WIZARD", "A wise spellcaster with magical powers"),
            new WordEntry("CASTLE", "A fortified royal residence with towers"),
            new WordEntry("PENGUIN", "Flightless aquatic bird of the polar regions"),
            new WordEntry("GUITAR", "A six-string musical instrument"),
            new WordEntry("DIAMOND", "The hardest known natural mineral"),
            new WordEntry("JUNGLE", "A dense, tropical wild forest"),
            new WordEntry("PIRATE", "A swashbuckling mariner of the high seas"),
            new WordEntry("VOLCANO", "A mountain with a crater rupturing lava"),
            new WordEntry("TORNADO", "A violently rotating column of air"),
            new WordEntry("CHAMPION", "The titleholder who defeats all rivals"),
            new WordEntry("MYSTERY", "Something unexplained or secretive"),
            new WordEntry("THUNDER", "The loud acoustic boom following lightning")
    );

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GuessResult {
        private boolean correct;
        private int roundIndex;
        private String targetWord;
        private String solvedByUserId;
        private boolean isGameFinished;
        private String matchWinnerId;
    }

    public List<WordEntry> pickRandomWords(int count) {
        List<WordEntry> pool = new ArrayList<>(WORD_BANK);
        Collections.shuffle(pool);
        return pool.subList(0, Math.min(count, pool.size()));
    }

    public String scrambleWord(String word) {
        List<Character> chars = new ArrayList<>();
        for (char c : word.toCharArray()) {
            chars.add(c);
        }
        String scrambled;
        int attempts = 0;
        do {
            Collections.shuffle(chars);
            StringBuilder sb = new StringBuilder();
            for (char c : chars) {
                sb.append(c);
            }
            scrambled = sb.toString();
            attempts++;
        } while (scrambled.equalsIgnoreCase(word) && attempts < 10);
        return scrambled;
    }

    public GuessResult evaluateGuess(
            String targetWord,
            String guess,
            String userId,
            int currentRound,
            int totalRounds,
            Map<String, Integer> playerScores
    ) {
        if (targetWord == null || guess == null) {
            return GuessResult.builder().correct(false).roundIndex(currentRound).build();
        }

        boolean isCorrect = targetWord.trim().equalsIgnoreCase(guess.trim());
        if (!isCorrect) {
            return GuessResult.builder()
                    .correct(false)
                    .roundIndex(currentRound)
                    .targetWord(targetWord)
                    .build();
        }

        int score = playerScores.getOrDefault(userId, 0);
        playerScores.put(userId, score + 100);

        boolean gameFinished = (currentRound + 1 >= totalRounds);
        String matchWinnerId = null;

        if (gameFinished) {
            matchWinnerId = playerScores.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(userId);
        }

        return GuessResult.builder()
                .correct(true)
                .roundIndex(currentRound)
                .targetWord(targetWord)
                .solvedByUserId(userId)
                .isGameFinished(gameFinished)
                .matchWinnerId(matchWinnerId)
                .build();
    }
}
