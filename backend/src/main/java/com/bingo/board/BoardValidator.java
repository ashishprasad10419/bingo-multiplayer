package com.bingo.board;

import com.bingo.game.GameEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class BoardValidator {

    private final GameEngine gameEngine;

    public void validateBoardOrThrow(List<List<Integer>> board, int boardSize) {
        if (!gameEngine.validateBoard(board, boardSize)) {
            throw new IllegalArgumentException("Invalid board configuration: Must be a " +
                    boardSize + "x" + boardSize + " grid containing all unique numbers from 1 to " +
                    (boardSize * boardSize));
        }
    }
}
