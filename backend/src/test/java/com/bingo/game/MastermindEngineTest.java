package com.bingo.game;

import com.bingo.game.engine.MastermindEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class MastermindEngineTest {

    private MastermindEngine engine;

    @BeforeEach
    void setUp() {
        engine = new MastermindEngine();
    }

    @Test
    @DisplayName("Evaluate exact match win (4 black pegs)")
    void testExactMatchWin() {
        List<String> secret = List.of("RED", "BLUE", "GREEN", "YELLOW");
        List<String> guess = List.of("RED", "BLUE", "GREEN", "YELLOW");

        MastermindEngine.Evaluation eval = engine.evaluateGuess(secret, guess);
        assertEquals(4, eval.getExactMatches());
        assertEquals(0, eval.getColorMatches());
        assertTrue(eval.isWin());
    }

    @Test
    @DisplayName("Evaluate completely wrong guess (0 exact, 0 color)")
    void testCompletelyWrongGuess() {
        List<String> secret = List.of("RED", "RED", "RED", "RED");
        List<String> guess = List.of("BLUE", "BLUE", "GREEN", "YELLOW");

        MastermindEngine.Evaluation eval = engine.evaluateGuess(secret, guess);
        assertEquals(0, eval.getExactMatches());
        assertEquals(0, eval.getColorMatches());
        assertFalse(eval.isWin());
    }

    @Test
    @DisplayName("Evaluate misplaced colors (0 exact, 4 white pegs)")
    void testAllMisplacedColors() {
        List<String> secret = List.of("RED", "BLUE", "GREEN", "YELLOW");
        List<String> guess = List.of("YELLOW", "GREEN", "BLUE", "RED");

        MastermindEngine.Evaluation eval = engine.evaluateGuess(secret, guess);
        assertEquals(0, eval.getExactMatches());
        assertEquals(4, eval.getColorMatches());
        assertFalse(eval.isWin());
    }

    @Test
    @DisplayName("Evaluate duplicate colors without double counting")
    void testDuplicateColorsNoDoubleCounting() {
        // Secret has one RED, guess has two REDs
        List<String> secret = List.of("RED", "BLUE", "GREEN", "YELLOW");
        List<String> guess = List.of("RED", "RED", "PURPLE", "ORANGE");

        MastermindEngine.Evaluation eval = engine.evaluateGuess(secret, guess);
        assertEquals(1, eval.getExactMatches());
        assertEquals(0, eval.getColorMatches()); // The second RED must NOT count as a color match
        assertFalse(eval.isWin());
    }

    @Test
    @DisplayName("Evaluate secret with multiple duplicates")
    void testSecretWithDuplicates() {
        // Secret has two REDs, guess has two REDs in different positions
        List<String> secret = List.of("RED", "RED", "BLUE", "GREEN");
        List<String> guess = List.of("BLUE", "RED", "RED", "ORANGE");

        MastermindEngine.Evaluation eval = engine.evaluateGuess(secret, guess);
        // Position 1: RED vs RED -> 1 exact match
        // Position 0: BLUE in guess vs BLUE at position 2 in secret -> 1 color match
        // Position 2: RED in guess vs RED at position 0 in secret -> 1 color match
        // Position 3: ORANGE -> 0 match
        assertEquals(1, eval.getExactMatches());
        assertEquals(2, eval.getColorMatches());
        assertFalse(eval.isWin());
    }

    @Test
    @DisplayName("Validate code length and colors")
    void testCodeValidation() {
        assertTrue(engine.isValidCode(List.of("RED", "BLUE", "GREEN", "YELLOW")));
        assertTrue(engine.isValidCode(List.of("purple", "orange", "red", "blue"))); // case-insensitive

        assertFalse(engine.isValidCode(List.of("RED", "BLUE", "GREEN"))); // too short
        assertFalse(engine.isValidCode(List.of("RED", "BLUE", "GREEN", "YELLOW", "PURPLE"))); // too long
        assertFalse(engine.isValidCode(List.of("RED", "BLUE", "GREEN", "BLACK"))); // invalid color
        assertFalse(engine.isValidCode(null));
    }

    @Test
    @DisplayName("Generate random 4-color code")
    void testGenerateRandomCode() {
        for (int i = 0; i < 20; i++) {
            List<String> code = engine.generateRandomCode();
            assertNotNull(code);
            assertEquals(4, code.size());
            assertTrue(engine.isValidCode(code));
        }
    }
}
