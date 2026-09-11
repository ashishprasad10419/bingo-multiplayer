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
    private final com.bingo.game.engine.TicTacToeEngine ticTacToeEngine;
    private final com.bingo.game.engine.DotsAndBoxesEngine dotsAndBoxesEngine;
    private final TurnService turnService;
    private final WinnerService winnerService;
    private final GameEventService gameEventService;

    public synchronized Game processCallNumber(String senderUserId, CallNumberRequest request) {
        Game game = gameRepository.findById(request.getGameId())
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + request.getGameId()));

        int number = request.getNumber();
        int maxNumber = game.getBoardSize() * game.getBoardSize();

        if (number < 1 || number > maxNumber) {
            throw new IllegalArgumentException("Number must be between 1 and " + maxNumber);
        }

        // Idempotency guard: If number was already processed (e.g. fast dual-channel delivery),
        // gracefully return the existing game state rather than throwing an exception
        if (game.getCalledNumbers() == null) {
            game.setCalledNumbers(new ArrayList<>());
        }
        if (game.getCalledNumbers().contains(number)) {
            log.info("Idempotent call-number acknowledged: user={} number={} already called in game={}",
                    senderUserId, number, game.getId());
            return game;
        }

        // 1. Server-side turn validation
        turnService.validateTurn(game, senderUserId);

        // 2. Append called number and move record
        game.getCalledNumbers().add(number);
        game.setMoveNumber(game.getMoveNumber() + 1);

        GamePlayer caller = game.findPlayer(senderUserId);
        String callerUsername = caller != null ? caller.getUsername() : "Player";

        if (game.getMoves() == null) {
            game.setMoves(new ArrayList<>());
        }
        game.getMoves().add(com.bingo.game.dto.CalledNumberRecord.builder()
                .number(number)
                .calledByUserId(senderUserId)
                .calledByUsername(callerUsername)
                .build());

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
                        "username", callerUsername
                ),
                "nextTurn", game.getCurrentTurnUserId(),
                "calledNumbers", game.getCalledNumbers(),
                "moves", game.getMoves()
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

    public Game getGameByRoomCode(String roomCode, String userId) {
        // Try currently playing game first
        Game game = gameRepository.findByRoomCodeAndStatus(roomCode.toUpperCase(), GameStatus.PLAYING)
                .orElseGet(() -> gameRepository.findFirstByRoomCodeOrderByStartedAtDesc(roomCode.toUpperCase())
                        .orElseThrow(() -> new IllegalArgumentException("No game found for room: " + roomCode)));

        if (userId != null) {
            GamePlayer player = game.findPlayer(userId);
            if (player != null) {
                player.setConnectionStatus(ConnectionStatus.CONNECTED);
                gameRepository.save(game);
                gameEventService.publishEvent(game.getRoomCode(), game.getId(), "PLAYER_RECONNECTED", Map.of(
                        "userId", userId
                ));
            }
        }
        return game;
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

    public void broadcastEmote(String userId, String gameId, String emote) {
        Game game = getGameById(gameId);
        GamePlayer player = game.findPlayer(userId);
        String username = player != null ? player.getUsername() : "Player";
        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "EMOTE_SENT", Map.of(
                "userId", userId,
                "username", username,
                "emote", emote,
                "timestamp", System.currentTimeMillis()
        ));
    }

    public synchronized Game processTttMove(String senderUserId, String gameId, int row, int col) {
        Game game = getGameById(gameId);
        turnService.validateTurn(game, senderUserId);

        int gridSize = game.getTttGridSize() > 0 ? game.getTttGridSize() : 3;
        com.bingo.game.engine.TicTacToeEngine.Result result =
                ticTacToeEngine.processMove(game.getTttBoard(), gridSize, row, col, senderUserId);

        game.setMoveNumber(game.getMoveNumber() + 1);

        if (result == com.bingo.game.engine.TicTacToeEngine.Result.WIN) {
            GamePlayer winner = game.findPlayer(senderUserId);
            winnerService.handleGameFinished(game, winner);
            game = gameRepository.save(game);
        } else if (result == com.bingo.game.engine.TicTacToeEngine.Result.DRAW) {
            game.setStatus(GameStatus.FINISHED);
            game.setFinishedAt(java.time.Instant.now());
            game = gameRepository.save(game);
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "GAME_DRAW", Map.of(
                    "reason", "Board is full"
            ));
        } else {
            turnService.advanceTurn(game);
            game = gameRepository.save(game);
        }

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TTT_MOVE_MADE", Map.of(
                "row", row,
                "col", col,
                "userId", senderUserId,
                "tttBoard", game.getTttBoard(),
                "nextTurn", game.getCurrentTurnUserId(),
                "status", game.getStatus().name()
        ));

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                "currentTurnUserId", game.getCurrentTurnUserId()
        ));

        return game;
    }

    public synchronized Game processDotsLine(String senderUserId, String gameId, String lineType, int row, int col) {
        Game game = getGameById(gameId);
        turnService.validateTurn(game, senderUserId);

        int dotsSize = game.getDotsGridSize() > 0 ? game.getDotsGridSize() : 4;
        com.bingo.game.engine.DotsAndBoxesEngine.MoveResult result = dotsAndBoxesEngine.drawLine(
                dotsSize,
                lineType,
                row,
                col,
                senderUserId,
                game.getHorizontalLines(),
                game.getVerticalLines(),
                game.getCompletedBoxes(),
                game.getPlayerScores()
        );

        game.setMoveNumber(game.getMoveNumber() + 1);

        if (result.isGameFinished()) {
            if (result.isDraw()) {
                game.setStatus(GameStatus.FINISHED);
                game.setFinishedAt(java.time.Instant.now());
                game = gameRepository.save(game);
                gameEventService.publishEvent(game.getRoomCode(), game.getId(), "GAME_DRAW", Map.of(
                        "scores", game.getPlayerScores()
                ));
            } else {
                GamePlayer winner = game.findPlayer(result.getWinnerId());
                winnerService.handleGameFinished(game, winner);
                game = gameRepository.save(game);
            }
        } else if (result.givesExtraTurn()) {
            // Player captured a box! Retains turn for bonus move
            game = gameRepository.save(game);
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "EXTRA_TURN_AWARDED", Map.of(
                    "userId", senderUserId,
                    "boxesCompleted", result.getBoxesCompleted()
            ));
        } else {
            // No box completed: advance turn
            turnService.advanceTurn(game);
            game = gameRepository.save(game);
        }

        Map<String, Object> payload = new HashMap<>();
        payload.put("lineType", lineType);
        payload.put("row", row);
        payload.put("col", col);
        payload.put("userId", senderUserId);
        payload.put("boxesCompleted", result.getBoxesCompleted());
        payload.put("completedBoxes", game.getCompletedBoxes());
        payload.put("playerScores", game.getPlayerScores());
        payload.put("horizontalLines", game.getHorizontalLines());
        payload.put("verticalLines", game.getVerticalLines());
        payload.put("nextTurn", game.getCurrentTurnUserId());
        payload.put("status", game.getStatus().name());

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "DOTS_LINE_DRAWN", payload);

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                "currentTurnUserId", game.getCurrentTurnUserId()
        ));

        return game;
    }
}
