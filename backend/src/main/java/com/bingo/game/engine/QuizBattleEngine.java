package com.bingo.game.engine;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class QuizBattleEngine {

    public static final int TOTAL_QUESTIONS = 5;

    public record QuizItem(String question, List<String> options, int correctIndex) {}

    private static final List<QuizItem> QUESTION_BANK = List.of(
            new QuizItem(
                    "Which planet in our solar system is nicknamed the 'Red Planet'?",
                    List.of("Venus", "Mars", "Jupiter", "Saturn"),
                    1
            ),
            new QuizItem(
                    "What is the highest-grossing media / video game franchise of all time?",
                    List.of("Super Mario", "Pokémon", "Call of Duty", "Star Wars"),
                    1
            ),
            new QuizItem(
                    "How many hearts does an octopus have?",
                    List.of("1", "2", "3", "4"),
                    2
            ),
            new QuizItem(
                    "What is the capital city of Australia?",
                    List.of("Sydney", "Melbourne", "Canberra", "Brisbane"),
                    2
            ),
            new QuizItem(
                    "Which chemical element has the symbol 'Au' on the periodic table?",
                    List.of("Silver", "Gold", "Copper", "Platinum"),
                    1
            ),
            new QuizItem(
                    "In what year was the original Apple iPhone released?",
                    List.of("2005", "2007", "2009", "2011"),
                    1
            ),
            new QuizItem(
                    "Which animal holds hands while sleeping so they do not drift away?",
                    List.of("Sea Otters", "Beavers", "Penguins", "Dolphins"),
                    0
            ),
            new QuizItem(
                    "In computer terminology, what does RAM stand for?",
                    List.of("Read Access Memory", "Random Access Memory", "Rapid Action Module", "Realtime Array Mode"),
                    1
            ),
            new QuizItem(
                    "How many bones are there in an adult human body?",
                    List.of("196", "206", "216", "226"),
                    1
            ),
            new QuizItem(
                    "What is the fastest land animal in the world?",
                    List.of("Cheetah", "Pronghorn", "Lion", "Falcon"),
                    0
            )
    );

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerResult {
        private boolean answered;
        private boolean correct;
        private int correctIndex;
        private int earnedPoints;
        private boolean roundComplete;
        private boolean matchComplete;
        private String matchWinnerId;
    }

    public List<QuizItem> pickRandomQuestions(int count) {
        List<QuizItem> pool = new ArrayList<>(QUESTION_BANK);
        Collections.shuffle(pool);
        return pool.subList(0, Math.min(count, pool.size()));
    }

    public AnswerResult submitAnswer(
            int currentQuestionIndex,
            int correctIndex,
            int selectedOption,
            String userId,
            Map<String, Integer> currentAnswers,
            int totalPlayers,
            Map<String, Integer> playerScores,
            int totalQuestions
    ) {
        if (selectedOption < 0 || selectedOption > 3) {
            throw new IllegalArgumentException("Option index must be 0, 1, 2, or 3");
        }

        if (currentAnswers.containsKey(userId)) {
            return AnswerResult.builder()
                    .answered(false)
                    .correct(false)
                    .correctIndex(correctIndex)
                    .earnedPoints(0)
                    .roundComplete(currentAnswers.size() >= totalPlayers)
                    .matchComplete(false)
                    .build();
        }

        currentAnswers.put(userId, selectedOption);

        boolean isCorrect = (selectedOption == correctIndex);
        int earned = 0;
        if (isCorrect) {
            earned = 100;
            int score = playerScores.getOrDefault(userId, 0);
            playerScores.put(userId, score + earned);
        }

        boolean allPlayersAnswered = currentAnswers.size() >= totalPlayers;
        boolean matchComplete = false;
        String matchWinnerId = null;

        if (allPlayersAnswered && (currentQuestionIndex + 1 >= totalQuestions)) {
            matchComplete = true;
            matchWinnerId = playerScores.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse(userId);
        }

        return AnswerResult.builder()
                .answered(true)
                .correct(isCorrect)
                .correctIndex(correctIndex)
                .earnedPoints(earned)
                .roundComplete(allPlayersAnswered)
                .matchComplete(matchComplete)
                .matchWinnerId(matchWinnerId)
                .build();
    }
}
