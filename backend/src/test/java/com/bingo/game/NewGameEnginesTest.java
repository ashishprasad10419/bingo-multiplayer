package com.bingo.game;

import com.bingo.game.engine.*;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class NewGameEnginesTest {

    @Test
    void testConnectFourHorizontalWin() {
        ConnectFourEngine engine = new ConnectFourEngine();
        List<String> board = engine.initializeBoard(7, 6);

        // Player 1 drops in col 0, 1, 2, 3 (all bottom row = row 5)
        engine.dropChip(board, 7, 6, 0, "user1");
        engine.dropChip(board, 7, 6, 1, "user1");
        engine.dropChip(board, 7, 6, 2, "user1");
        ConnectFourEngine.MoveResult result = engine.dropChip(board, 7, 6, 3, "user1");

        assertEquals(ConnectFourEngine.Status.WIN, result.getStatus());
        assertEquals(4, result.getWinningCells().size());
    }

    @Test
    void testConnectFourVerticalWin() {
        ConnectFourEngine engine = new ConnectFourEngine();
        List<String> board = engine.initializeBoard(7, 6);

        // Player 1 drops 4 times in col 2
        engine.dropChip(board, 7, 6, 2, "user1");
        engine.dropChip(board, 7, 6, 2, "user1");
        engine.dropChip(board, 7, 6, 2, "user1");
        ConnectFourEngine.MoveResult result = engine.dropChip(board, 7, 6, 2, "user1");

        assertEquals(ConnectFourEngine.Status.WIN, result.getStatus());
        assertEquals(4, result.getWinningCells().size());
    }

    @Test
    void testRockPaperScissorsDuel() {
        RockPaperScissorsEngine engine = new RockPaperScissorsEngine();
        Map<String, String> choices = new HashMap<>();
        Map<String, Integer> scores = new HashMap<>();

        choices.put("alice", "ROCK");
        choices.put("bob", "SCISSORS");

        RockPaperScissorsEngine.RoundResult result = engine.evaluateRound("alice", "bob", choices, scores, 3);
        assertTrue(result.isRoundComplete());
        assertEquals("alice", result.getRoundWinnerId());
        assertEquals(1, scores.get("alice"));
        assertFalse(result.isMatchWon());
    }

    @Test
    void testMemoryMatchLogic() {
        MemoryEngine engine = new MemoryEngine();
        List<String> cards = List.of(
                "STAR", "STAR", "HEART", "HEART",
                "GEM", "GEM", "FIRE", "FIRE",
                "SHIELD", "SHIELD", "CROWN", "CROWN",
                "LIGHTNING", "LIGHTNING", "ROCKET", "ROCKET"
        );
        List<Boolean> matched = new ArrayList<>(Collections.nCopies(16, false));
        List<Integer> flipped = new ArrayList<>();
        Map<String, Integer> scores = new HashMap<>();

        // Flip first card
        MemoryEngine.FlipResult r1 = engine.processFlip(cards, matched, flipped, 0, "u1", scores);
        assertEquals(MemoryEngine.Status.FIRST_CARD_FLIPPED, r1.getStatus());

        // Flip matching second card
        MemoryEngine.FlipResult r2 = engine.processFlip(cards, matched, flipped, 1, "u1", scores);
        assertEquals(MemoryEngine.Status.MATCH, r2.getStatus());
        assertTrue(matched.get(0));
        assertTrue(matched.get(1));
        assertEquals(1, scores.get("u1"));
    }

    @Test
    void testNumberRushTapSequence() {
        NumberRushEngine engine = new NumberRushEngine();
        Map<String, Integer> progress = new HashMap<>();

        // Valid tap 1
        NumberRushEngine.TapResult t1 = engine.processTap("u1", 1, progress);
        assertEquals(NumberRushEngine.TapStatus.CORRECT, t1.getStatus());
        assertEquals(2, t1.getNextExpected());

        // Invalid tap (taps 5 instead of 2)
        NumberRushEngine.TapResult t2 = engine.processTap("u1", 5, progress);
        assertEquals(NumberRushEngine.TapStatus.WRONG, t2.getStatus());
        assertEquals(2, t2.getNextExpected());
    }

    @Test
    void testWordScrambleEvaluation() {
        WordScrambleEngine engine = new WordScrambleEngine();
        Map<String, Integer> scores = new HashMap<>();

        WordScrambleEngine.GuessResult g1 = engine.evaluateGuess("PLANET", "wrong", "u1", 0, 5, scores);
        assertFalse(g1.isCorrect());

        WordScrambleEngine.GuessResult g2 = engine.evaluateGuess("PLANET", "planet", "u1", 0, 5, scores);
        assertTrue(g2.isCorrect());
        assertEquals(100, scores.get("u1"));
    }

    @Test
    void testQuizBattleSubmission() {
        QuizBattleEngine engine = new QuizBattleEngine();
        Map<String, Integer> answers = new HashMap<>();
        Map<String, Integer> scores = new HashMap<>();

        // Correct answer option 1
        QuizBattleEngine.AnswerResult ans = engine.submitAnswer(0, 1, 1, "u1", answers, 1, scores, 5);
        assertTrue(ans.isCorrect());
        assertEquals(100, ans.getEarnedPoints());
        assertTrue(ans.isRoundComplete());
    }
}
