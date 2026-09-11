package com.bingo.game;

import com.bingo.game.engine.DotsAndBoxesEngine;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class DotsAndBoxesEngineTest {

    private DotsAndBoxesEngine engine;

    @BeforeEach
    void setUp() {
        engine = new DotsAndBoxesEngine();
    }

    @Test
    void testDrawLineAndCompleteBox() {
        int dotsGridSize = 3; // 2x2 boxes
        List<String> hLines = new ArrayList<>();
        List<String> vLines = new ArrayList<>();
        Map<String, String> completedBoxes = new HashMap<>();
        Map<String, Integer> playerScores = new HashMap<>();

        // p1 draws top of box (0,0) -> H 0-0
        DotsAndBoxesEngine.MoveResult r1 = engine.drawLine(dotsGridSize, "H", 0, 0, "p1", hLines, vLines, completedBoxes, playerScores);
        assertEquals(0, r1.getBoxesCompleted());
        assertFalse(r1.givesExtraTurn());
        assertFalse(r1.isGameFinished());

        // p2 draws bottom of box (0,0) -> H 1-0
        DotsAndBoxesEngine.MoveResult r2 = engine.drawLine(dotsGridSize, "H", 1, 0, "p2", hLines, vLines, completedBoxes, playerScores);
        assertEquals(0, r2.getBoxesCompleted());

        // p1 draws left of box (0,0) -> V 0-0
        DotsAndBoxesEngine.MoveResult r3 = engine.drawLine(dotsGridSize, "V", 0, 0, "p1", hLines, vLines, completedBoxes, playerScores);
        assertEquals(0, r3.getBoxesCompleted());

        // p2 draws right of box (0,0) -> V 0-1 (completes box 0-0!)
        DotsAndBoxesEngine.MoveResult r4 = engine.drawLine(dotsGridSize, "V", 0, 1, "p2", hLines, vLines, completedBoxes, playerScores);
        assertEquals(1, r4.getBoxesCompleted());
        assertTrue(r4.givesExtraTurn());
        assertEquals("p2", completedBoxes.get("0-0"));
        assertEquals(1, playerScores.get("p2"));
    }

    @Test
    void testDuplicateLineThrows() {
        int dotsGridSize = 3;
        List<String> hLines = new ArrayList<>();
        List<String> vLines = new ArrayList<>();
        Map<String, String> completedBoxes = new HashMap<>();
        Map<String, Integer> playerScores = new HashMap<>();

        engine.drawLine(dotsGridSize, "H", 0, 0, "p1", hLines, vLines, completedBoxes, playerScores);
        assertThrows(IllegalStateException.class, () ->
                engine.drawLine(dotsGridSize, "H", 0, 0, "p2", hLines, vLines, completedBoxes, playerScores));
    }
}
