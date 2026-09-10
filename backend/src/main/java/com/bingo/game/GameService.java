package com.bingo.game;

import com.bingo.game.dto.CallNumberRequest;
import com.bingo.websocket.GameEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameService {

    private final GameRepository gameRepository;
    private final GameHistoryRepository gameHistoryRepository;
    private final GameEngine gameEngine;
    private final TurnService turnService;
    private final WinnerService winnerService;
    private final GameEventService gameEventService;

    public synchronized Game processCallNumber(String senderUserId, CallNumberRequest request) {
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + request.getGameId()));

        int number = request.getNumber();
        int maxNumber = game.getBoardSize() * game.getBoardSize();

        // 1. Server-side validation
        turnService.validateTurn(game, senderUserId);

        if (number < 1 || number > maxNumber) {
            throw new IllegalArgumentException("Number must be between 1 and " + maxNumber);
        }

        if (game.getCalledNumbers().contains(number)) {
            throw new IllegalArgumentException("Number " + number + " has already been called");
        }

        // 2. Append called number
        game.getCalledNumbers().add(number);
        game.setMoveNumber(game.getMoveNumber() + 1);

        GamePlayer caller = game.findPlayer(senderUserId);

        // 3. Recalculate lineCount for every player
        GamePlayer potentialWinner = null;
        for (GamePlayer player : game.getPlayers()) {
            int previousLines = player.getLineCount();
            int newLines = gameEngine.calculateLineCount(player.getBoard(), game.getCalledNumbers(), game.getBoardSize());
            player.setLineCount(newLines);

            if (newLines > previousLines) {
                gameEventService.publishEvent(game.getRoomCode(), game.getId(), "LINE_COMPLETED", Map.of(
                        "userId", player.getUserId(),
                        "lineCount", newLines
                ));
            }

            if (potentialWinner == null && gameEngine.checkWinner(newLines, game.getWinningLines())) {
                potentialWinner = player;
            }
        }

        // 4. Winner or Advance Turn
        if (potentialWinner != null) {
            winnerService.handleGameFinished(game, potentialWinner);
            game = gameRepository.save(game);
            return game;
        }

        // Advance to next player
        turnService.advanceTurn(game);
        game = gameRepository.save(game);

        // Broadcast NUMBER_CALLED event
        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "NUMBER_CALLED", Map.of(
                "number", number,
                "calledBy", Map.of(
                        "userId", senderUserId,
                        "username", caller != null ? caller.getUsername() : "Player"
                ),
                "nextTurn", game.getCurrentTurnUserId(),
                "calledNumbers", game.getCalledNumbers()
        ));

        // Also broadcast TURN_CHANGED
        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                "currentTurnUserId", game.getCurrentTurnUserId()
        ));

        return game;
    }

    public Game getGameById(String gameId) {
        return gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));
    }

    public Game handlePlayerReconnect(String gameId, String userId) {
        Game game = getGameById(gameId);
        GamePlayer player = game.findPlayer(userId);
        if (player != null) {
            player.setConnectionStatus(ConnectionStatus.CONNECTED);
            gameRepository.save(game);

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "PLAYER_RECONNECTED", Map.of(
                    "userId", userId
            ));
        }
        return game;
    }

    public void handlePlayerDisconnect(String gameId, String userId) {
        Game game = gameRepository.findById(gameId).orElse(null);
        if (game == null || game.getStatus() != GameStatus.PLAYING) return;

        GamePlayer player = game.findPlayer(userId);
        if (player != null) {
            player.setConnectionStatus(ConnectionStatus.DISCONNECTED);
            gameRepository.save(game);

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "PLAYER_DISCONNECTED", Map.of(
                    "userId", userId
            ));
        }
    }

    public List<GameHistory> getUserGameHistory(String userId, int limit) {
        return gameHistoryRepository.findByPlayersContainingOrderByFinishedAtDesc(
                userId, PageRequest.of(0, Math.min(limit, 50))
        );
    }
}
