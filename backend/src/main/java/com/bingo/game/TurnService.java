package com.bingo.game;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class TurnService {

    private final GameEngine gameEngine;

    public void validateTurn(Game game, String senderUserId) {
        if (game.getStatus() != GameStatus.PLAYING) {
            throw new IllegalStateException("Game is not in PLAYING status (current: " + game.getStatus() + ")");
        }
        if (!game.getCurrentTurnUserId().equals(senderUserId)) {
            throw new IllegalStateException("Not your turn. Current turn belongs to user: " + game.getCurrentTurnUserId());
        }
    }

    public void advanceTurn(Game game) {
        int nextIndex = gameEngine.getNextPlayerIndex(game.getCurrentPlayerIndex(), game.getPlayers().size());
        game.setCurrentPlayerIndex(nextIndex);
        game.setCurrentTurnUserId(game.getPlayers().get(nextIndex).getUserId());
    }
}
