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

        // Duplicate submission should be rejected and not add duplicate points
        QuizBattleEngine.AnswerResult dup = engine.submitAnswer(0, 1, 1, "u1", answers, 1, scores, 5);
        assertFalse(dup.isAnswered());
        assertEquals(0, dup.getEarnedPoints());
        assertEquals(100, scores.get("u1"));
    }

    @Test
    void testConnectFourDiagonalWin() {
        ConnectFourEngine engine = new ConnectFourEngine();
        List<String> board = engine.initializeBoard(7, 6);

        // Build a diagonal \ for user1:
        // Col 0: user1 (row 5)
        // Col 1: user2 (row 5), user1 (row 4)
        // Col 2: user2 (row 5), user2 (row 4), user1 (row 3)
        // Col 3: user2 (row 5), user2 (row 4), user2 (row 3), user1 (row 2)
        engine.dropChip(board, 7, 6, 0, "u1");

        engine.dropChip(board, 7, 6, 1, "u2");
        engine.dropChip(board, 7, 6, 1, "u1");

        engine.dropChip(board, 7, 6, 2, "u2");
        engine.dropChip(board, 7, 6, 2, "u2");
        engine.dropChip(board, 7, 6, 2, "u1");

        engine.dropChip(board, 7, 6, 3, "u2");
        engine.dropChip(board, 7, 6, 3, "u2");
        engine.dropChip(board, 7, 6, 3, "u2");
        ConnectFourEngine.MoveResult result = engine.dropChip(board, 7, 6, 3, "u1");

        assertEquals(ConnectFourEngine.Status.WIN, result.getStatus());
        assertEquals(4, result.getWinningCells().size());
    }

    @Test
    void testRpsTargetWinsAndTie() {
        RockPaperScissorsEngine engine = new RockPaperScissorsEngine();
        Map<String, String> choices = new HashMap<>();
        Map<String, Integer> scores = new HashMap<>();

        // Round 1: Tie
        choices.put("p1", "ROCK");
        choices.put("p2", "ROCK");
        RockPaperScissorsEngine.RoundResult r1 = engine.evaluateRound("p1", "p2", choices, scores, 2);
        assertTrue(r1.isTie());
        assertNull(r1.getRoundWinnerId());
        assertFalse(r1.isMatchWon());

        // Round 2: P1 wins
        choices.put("p1", "PAPER");
        choices.put("p2", "ROCK");
        RockPaperScissorsEngine.RoundResult r2 = engine.evaluateRound("p1", "p2", choices, scores, 2);
        assertFalse(r2.isTie());
        assertEquals("p1", r2.getRoundWinnerId());
        assertEquals(1, scores.get("p1"));
        assertFalse(r2.isMatchWon());

        // Round 3: P1 wins again, reaching target 2
        choices.put("p1", "SCISSORS");
        choices.put("p2", "PAPER");
        RockPaperScissorsEngine.RoundResult r3 = engine.evaluateRound("p1", "p2", choices, scores, 2);
        assertTrue(r3.isMatchWon());
        assertEquals("p1", r3.getMatchWinnerId());
    }

    @Test
    void testDotsAndBoxesSimultaneousDoubleBoxCapture() {
        DotsAndBoxesEngine engine = new DotsAndBoxesEngine();
        int dotsSize = 3; // 2x2 boxes
        List<String> hLines = new ArrayList<>();
        List<String> vLines = new ArrayList<>();
        Map<String, String> boxes = new HashMap<>();
        Map<String, Integer> scores = new HashMap<>();

        // Surround box (0,0) and box (0,1) except for the middle vertical line dividing them (row 0, col 1)
        // Box (0,0) has top: H 0-0, bottom: H 1-0, left: V 0-0, right: V 0-1
        // Box (0,1) has top: H 0-1, bottom: H 1-1, left: V 0-1, right: V 0-2
        hLines.add("0-0");
        hLines.add("1-0");
        vLines.add("0-0");

        hLines.add("0-1");
        hLines.add("1-1");
        vLines.add("0-2");

        // Player "u1" draws the dividing vertical line V 0-1
        DotsAndBoxesEngine.MoveResult res = engine.drawLine(
                dotsSize, "V", 0, 1, "u1", hLines, vLines, boxes, scores
        );

        assertEquals(2, res.getBoxesCompleted(), "Both adjacent boxes should complete simultaneously");
        assertEquals(2, scores.get("u1"), "Player should receive 2 points");
        assertEquals("u1", boxes.get("0-0"));
        assertEquals("u1", boxes.get("0-1"));
        assertTrue(res.givesExtraTurn());
    }

    @Test
    void testNumberRushFullGameToWinner() {
        NumberRushEngine engine = new NumberRushEngine();
        Map<String, Integer> progress = new HashMap<>();

        for (int i = 1; i <= 24; i++) {
            NumberRushEngine.TapResult res = engine.processTap("u1", i, progress);
            assertEquals(NumberRushEngine.TapStatus.CORRECT, res.getStatus());
            assertFalse(res.isWinner());
        }

        // Tap 25 to win
        NumberRushEngine.TapResult winRes = engine.processTap("u1", 25, progress);
        assertEquals(NumberRushEngine.TapStatus.FINISHED, winRes.getStatus());
        assertTrue(winRes.isWinner());
        assertEquals("u1", winRes.getWinnerId());
    }
}
