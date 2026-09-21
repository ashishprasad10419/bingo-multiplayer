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
    private final com.bingo.game.engine.ConnectFourEngine connectFourEngine;
    private final com.bingo.game.engine.RockPaperScissorsEngine rockPaperScissorsEngine;
    private final com.bingo.game.engine.MemoryEngine memoryEngine;
    private final com.bingo.game.engine.NumberRushEngine numberRushEngine;
    private final com.bingo.game.engine.WordScrambleEngine wordScrambleEngine;
    private final com.bingo.game.engine.QuizBattleEngine quizBattleEngine;
    private final com.bingo.game.engine.ShipBattleEngine shipBattleEngine;
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

        // Idempotency guard: By clientMoveId or number already called
        if (request.getClientMoveId() != null && !request.getClientMoveId().isBlank()) {
            if (game.getProcessedMoveIds() == null) {
                game.setProcessedMoveIds(new HashSet<>());
            }
            if (game.getProcessedMoveIds().contains(request.getClientMoveId())) {
                log.info("Idempotent call-number ignored by clientMoveId: user={} id={}", senderUserId, request.getClientMoveId());
                return game;
            }
            game.getProcessedMoveIds().add(request.getClientMoveId());
        }

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

        game.setVersion(game.getVersion() + 1);

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
        boolean isBlackoutMode = "BLACKOUT".equalsIgnoreCase(game.getBingoMode());

        for (GamePlayer player : game.getPlayers()) {
            int previousLines = player.getLineCount();
            int newLines = gameEngine.calculateLineCount(player.getBoard(), game.getCalledNumbers(), game.getBoardSize());
            player.setLineCount(newLines);

            if (newLines > previousLines) {
                gameEventService.publishEvent(game.getRoomCode(), game.getId(), "LINE_COMPLETED", Map.of(
                        "userId", player.getUserId(),
                        "lineCount", newLines
                ), game.getVersion());
            }

            if (potentialWinner == null) {
                if (isBlackoutMode) {
                    if (gameEngine.isBlackout(player.getBoard(), game.getCalledNumbers())) {
                        potentialWinner = player;
                    }
                } else if (gameEngine.checkWinner(newLines, game.getWinningLines())) {
                    potentialWinner = player;
                }
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
        ), game.getVersion());

        // Also broadcast TURN_CHANGED
        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                "currentTurnUserId", game.getCurrentTurnUserId()
        ), game.getVersion());

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
        return sanitizeGameForPlayer(game, userId);
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
        return sanitizeGameForPlayer(game, userId);
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
        return processTttMove(senderUserId, gameId, row, col, null);
    }

    public synchronized Game processTttMove(String senderUserId, String gameId, int row, int col, String clientMoveId) {
        Game game = getGameById(gameId);

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) {
                game.setProcessedMoveIds(new HashSet<>());
            }
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate TTT move ignored by clientMoveId: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        turnService.validateTurn(game, senderUserId);

        int gridSize = game.getTttGridSize() > 0 ? game.getTttGridSize() : 3;
        com.bingo.game.engine.TicTacToeEngine.Result result =
                ticTacToeEngine.processMove(game.getTttBoard(), gridSize, row, col, senderUserId);

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);

        if (result == com.bingo.game.engine.TicTacToeEngine.Result.WIN) {
            GamePlayer winner = game.findPlayer(senderUserId);
            winnerService.handleGameFinished(game, winner);
            game = gameRepository.save(game);
        } else if (result == com.bingo.game.engine.TicTacToeEngine.Result.DRAW) {
            winnerService.handleGameDraw(game, "Board is full");
            game = gameRepository.save(game);
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
        ), game.getVersion());

        if (game.getStatus() == GameStatus.PLAYING) {
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                    "currentTurnUserId", game.getCurrentTurnUserId()
            ), game.getVersion());
        }

        return game;
    }

    public synchronized Game processDotsLine(String senderUserId, String gameId, String lineType, int row, int col) {
        return processDotsLine(senderUserId, gameId, lineType, row, col, null);
    }

    public synchronized Game processDotsLine(String senderUserId, String gameId, String lineType, int row, int col, String clientMoveId) {
        Game game = getGameById(gameId);

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) {
                game.setProcessedMoveIds(new HashSet<>());
            }
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate Dots move ignored by clientMoveId: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        turnService.validateTurn(game, senderUserId);

        if (game.getLineOwners() == null) {
            game.setLineOwners(new HashMap<>());
        }
        String lineKey = lineType.toUpperCase() + "-" + row + "-" + col;
        game.getLineOwners().put(lineKey, senderUserId);

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
        game.setVersion(game.getVersion() + 1);

        if (result.isGameFinished()) {
            if (result.isDraw()) {
                winnerService.handleGameDraw(game, "Tied score: " + game.getPlayerScores());
                game = gameRepository.save(game);
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
            ), game.getVersion());
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
        payload.put("lineOwners", game.getLineOwners());
        payload.put("nextTurn", game.getCurrentTurnUserId());
        payload.put("status", game.getStatus().name());

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "DOTS_LINE_DRAWN", payload, game.getVersion());

        if (game.getStatus() == GameStatus.PLAYING) {
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                    "currentTurnUserId", game.getCurrentTurnUserId()
            ), game.getVersion());
        }

        return game;
    }

    // ==========================================
    // 1. CONNECT FOUR
    // ==========================================
    public synchronized Game processC4Move(String senderUserId, String gameId, int col, String clientMoveId) {
        Game game = getGameById(gameId);

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) game.setProcessedMoveIds(new HashSet<>());
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate C4 move ignored by clientMoveId: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        turnService.validateTurn(game, senderUserId);

        com.bingo.game.engine.ConnectFourEngine.MoveResult result =
                connectFourEngine.dropChip(game.getC4Board(), 7, 6, col, senderUserId);

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);

        if (result.getStatus() == com.bingo.game.engine.ConnectFourEngine.Status.WIN) {
            game.setC4WinningCells(result.getWinningCells());
            GamePlayer winner = game.findPlayer(senderUserId);
            winnerService.handleGameFinished(game, winner);
            game = gameRepository.save(game);
        } else if (result.getStatus() == com.bingo.game.engine.ConnectFourEngine.Status.DRAW) {
            winnerService.handleGameDraw(game, "Board is full");
            game = gameRepository.save(game);
        } else {
            turnService.advanceTurn(game);
            game = gameRepository.save(game);
        }

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "C4_MOVE_MADE", Map.of(
                "row", result.getRow(),
                "col", result.getCol(),
                "userId", senderUserId,
                "c4Board", game.getC4Board(),
                "winningCells", game.getC4WinningCells(),
                "nextTurn", game.getCurrentTurnUserId(),
                "status", game.getStatus().name()
        ), game.getVersion());

        if (game.getStatus() == GameStatus.PLAYING) {
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                    "currentTurnUserId", game.getCurrentTurnUserId()
            ), game.getVersion());
        }

        return game;
    }

    // ==========================================
    // 2. ROCK PAPER SCISSORS
    // ==========================================
    public synchronized Game processRpsChoice(String senderUserId, String gameId, String choice, String clientMoveId) {
        Game game = getGameById(gameId);

        if (game.getStatus() != GameStatus.PLAYING) {
            return game;
        }

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) game.setProcessedMoveIds(new HashSet<>());
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate RPS choice ignored: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        if (!rockPaperScissorsEngine.isValidChoice(choice)) {
            throw new IllegalArgumentException("Invalid RPS choice: " + choice);
        }

        if (game.getRpsChoices() == null) {
            game.setRpsChoices(new HashMap<>());
        }
        game.getRpsChoices().put(senderUserId, choice.toUpperCase().trim());
        game.setVersion(game.getVersion() + 1);

        // Check if both players submitted
        if (game.getRpsChoices().size() >= 2) {
            String p1 = game.getPlayers().get(0).getUserId();
            String p2 = game.getPlayers().get(1).getUserId();

            if (game.getRpsRoundWins() == null) game.setRpsRoundWins(new HashMap<>());

            com.bingo.game.engine.RockPaperScissorsEngine.RoundResult result =
                    rockPaperScissorsEngine.evaluateRound(p1, p2, game.getRpsChoices(), game.getRpsRoundWins(), game.getRpsTargetWins());

            Map<String, Object> roundResultData = new HashMap<>();
            roundResultData.put("round", game.getRpsRound());
            roundResultData.put("p1UserId", p1);
            roundResultData.put("p2UserId", p2);
            roundResultData.put("user1Choice", result.getUser1Choice());
            roundResultData.put("user2Choice", result.getUser2Choice());
            Map<String, String> choicesMap = new HashMap<>();
            if (result.getUser1Choice() != null) choicesMap.put(p1, result.getUser1Choice());
            if (result.getUser2Choice() != null) choicesMap.put(p2, result.getUser2Choice());
            roundResultData.put("choices", choicesMap);
            roundResultData.put("roundWinnerId", result.getRoundWinnerId());
            roundResultData.put("isTie", result.isTie());
            roundResultData.put("roundScores", game.getRpsRoundWins());
            roundResultData.put("isMatchWon", result.isMatchWon());

            game.setRpsLastRoundResult(roundResultData);
            game.getRpsChoices().clear();

            if (result.isMatchWon()) {
                GamePlayer winner = game.findPlayer(result.getMatchWinnerId());
                winnerService.handleGameFinished(game, winner);
                game = gameRepository.save(game);
            } else {
                game.setRpsRound(game.getRpsRound() + 1);
                game = gameRepository.save(game);
            }

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "RPS_ROUND_RESOLVED", roundResultData, game.getVersion());
        } else {
            game = gameRepository.save(game);
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "RPS_CHOICE_LOCKED", Map.of(
                    "userId", senderUserId,
                    "round", game.getRpsRound()
            ), game.getVersion());
        }

        return game;
    }

    // ==========================================
    // 3. MEMORY MATCH
    // ==========================================
    public synchronized Game processMemoryFlip(String senderUserId, String gameId, int cardIndex, String clientMoveId) {
        Game game = getGameById(gameId);

        if (game.getStatus() != GameStatus.PLAYING) {
            return game;
        }

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) game.setProcessedMoveIds(new HashSet<>());
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate memory flip ignored by clientMoveId: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        turnService.validateTurn(game, senderUserId);

        if (game.getPlayerScores() == null) game.setPlayerScores(new HashMap<>());
        if (game.getMemoryFlippedIndices() == null) game.setMemoryFlippedIndices(new ArrayList<>());

        com.bingo.game.engine.MemoryEngine.FlipResult result = memoryEngine.processFlip(
                game.getMemoryCards(),
                game.getMemoryMatched(),
                game.getMemoryFlippedIndices(),
                cardIndex,
                senderUserId,
                game.getPlayerScores()
        );

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);

        if (result.isAllMatched()) {
            int maxScore = game.getPlayerScores().values().stream().mapToInt(Integer::intValue).max().orElse(0);
            long countMax = game.getPlayerScores().values().stream().filter(s -> s == maxScore).count();
            if (countMax > 1) {
                winnerService.handleGameDraw(game, "Tied pairs matched");
                game = gameRepository.save(game);
            } else {
                String highestUser = game.getPlayerScores().entrySet().stream()
                        .filter(e -> e.getValue() == maxScore)
                        .map(Map.Entry::getKey)
                        .findFirst()
                        .orElse(senderUserId);
                GamePlayer winner = game.findPlayer(highestUser);
                winnerService.handleGameFinished(game, winner);
                game = gameRepository.save(game);
            }
        } else if (!result.isExtraTurn()) {
            // Mismatch: advance turn
            turnService.advanceTurn(game);
            game = gameRepository.save(game);
        } else {
            // Match or first flip: player keeps turn
            game = gameRepository.save(game);
        }

        Map<String, Object> flipData = new HashMap<>();
        flipData.put("status", result.getStatus().name());
        flipData.put("userId", senderUserId);
        flipData.put("cardIndex", cardIndex);
        flipData.put("firstIndex", result.getFirstIndex());
        flipData.put("secondIndex", result.getSecondIndex());
        flipData.put("firstSymbol", result.getFirstSymbol());
        flipData.put("secondSymbol", result.getSecondSymbol());
        flipData.put("matched", game.getMemoryMatched());
        flipData.put("playerScores", game.getPlayerScores());
        flipData.put("nextTurn", game.getCurrentTurnUserId());

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "MEMORY_FLIP_RESULT", flipData, game.getVersion());

        if (game.getStatus() == GameStatus.PLAYING) {
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", Map.of(
                    "currentTurnUserId", game.getCurrentTurnUserId()
            ), game.getVersion());
        }

        return game;
    }

    // ==========================================
    // 4. NUMBER RUSH
    // ==========================================
    public synchronized Game processNumberRushTap(String senderUserId, String gameId, int tappedNumber, String clientMoveId) {
        Game game = getGameById(gameId);

        if (game.getStatus() != GameStatus.PLAYING) {
            return game;
        }

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) game.setProcessedMoveIds(new HashSet<>());
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate Number Rush tap ignored: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        if (game.getNumberRushProgress() == null) game.setNumberRushProgress(new HashMap<>());

        com.bingo.game.engine.NumberRushEngine.TapResult result =
                numberRushEngine.processTap(senderUserId, tappedNumber, game.getNumberRushProgress());

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);

        if (result.isWinner()) {
            GamePlayer winner = game.findPlayer(senderUserId);
            winnerService.handleGameFinished(game, winner);
            game = gameRepository.save(game);
        } else {
            game = gameRepository.save(game);
        }

        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "NUMBER_RUSH_TAP", Map.of(
                "userId", senderUserId,
                "tappedNumber", tappedNumber,
                "status", result.getStatus().name(),
                "nextExpected", result.getNextExpected(),
                "progress", game.getNumberRushProgress(),
                "isWinner", result.isWinner()
        ), game.getVersion());

        return game;
    }

    // ==========================================
    // 5. WORD SCRAMBLE
    // ==========================================
    public synchronized Game processWordScrambleGuess(String senderUserId, String gameId, String guess, String clientMoveId) {
        Game game = getGameById(gameId);

        if (game.getStatus() != GameStatus.PLAYING) {
            return game;
        }

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) game.setProcessedMoveIds(new HashSet<>());
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate Word Scramble guess ignored: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        if (game.getPlayerScores() == null) game.setPlayerScores(new HashMap<>());
        int round = game.getScrambleCurrentRound();
        if (round >= game.getScrambleWords().size()) {
            return game;
        }

        String targetWord = game.getScrambleWords().get(round);
        com.bingo.game.engine.WordScrambleEngine.GuessResult result =
                wordScrambleEngine.evaluateGuess(targetWord, guess, senderUserId, round, game.getScrambleWords().size(), game.getPlayerScores());

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);

        if (result.isCorrect()) {
            game.setScrambleLastWinnerId(senderUserId);
            GamePlayer solverPlayer = game.findPlayer(senderUserId);
            String solverName = (solverPlayer != null && solverPlayer.getUsername() != null)
                    ? solverPlayer.getUsername()
                    : "Player";

            Map<String, Object> solveRecord = new HashMap<>();
            solveRecord.put("round", round + 1);
            solveRecord.put("targetWord", targetWord);
            solveRecord.put("solvedByUserId", senderUserId);
            solveRecord.put("solverUsername", solverName);
            solveRecord.put("pointsAwarded", 100);
            solveRecord.put("timestamp", System.currentTimeMillis());

            game.setScrambleLastSolveResult(solveRecord);
            if (game.getScrambleRoundHistory() == null) {
                game.setScrambleRoundHistory(new ArrayList<>());
            }
            game.getScrambleRoundHistory().add(solveRecord);

            if (result.isGameFinished()) {
                int maxScore = game.getPlayerScores().values().stream().mapToInt(Integer::intValue).max().orElse(0);
                long countMax = game.getPlayerScores().values().stream().filter(s -> s == maxScore).count();
                if (countMax > 1) {
                    winnerService.handleGameDraw(game, "Tied score in word scramble");
                    game = gameRepository.save(game);
                } else {
                    GamePlayer winner = game.findPlayer(result.getMatchWinnerId());
                    winnerService.handleGameFinished(game, winner);
                    game = gameRepository.save(game);
                }
            } else {
                game.setScrambleCurrentRound(round + 1);
                game = gameRepository.save(game);
            }

            Map<String, Object> eventData = new HashMap<>();
            eventData.put("userId", senderUserId);
            eventData.put("solverUsername", solverName);
            eventData.put("targetWord", targetWord);
            eventData.put("guess", guess);
            eventData.put("pointsAwarded", 100);
            eventData.put("solveRecord", solveRecord);
            eventData.put("roundHistory", game.getScrambleRoundHistory());
            eventData.put("newRound", game.getScrambleCurrentRound());
            eventData.put("scores", game.getPlayerScores());
            eventData.put("isGameFinished", result.isGameFinished());

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "WORD_SCRAMBLE_SOLVED", eventData, game.getVersion());
        } else {
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "WORD_SCRAMBLE_INCORRECT", Map.of(
                    "userId", senderUserId,
                    "guess", guess
            ), game.getVersion());
        }

        return game;
    }

    // ==========================================
    // 6. QUIZ BATTLE
    // ==========================================
    public synchronized Game processQuizAnswer(String senderUserId, String gameId, int answerIndex, String clientMoveId) {
        Game game = getGameById(gameId);

        if (game.getStatus() != GameStatus.PLAYING) {
            return game;
        }

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds() == null) game.setProcessedMoveIds(new HashSet<>());
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate Quiz answer ignored: {}", clientMoveId);
                return game;
            }
            game.getProcessedMoveIds().add(clientMoveId);
        }

        if (game.getQuizAnswers() != null && game.getQuizAnswers().containsKey(senderUserId)) {
            log.info("User {} already submitted answer for question {}", senderUserId, game.getQuizCurrentQuestion());
            return game;
        }

        if (game.getPlayerScores() == null) game.setPlayerScores(new HashMap<>());
        if (game.getQuizAnswers() == null) game.setQuizAnswers(new HashMap<>());

        int currentQ = game.getQuizCurrentQuestion();
        if (currentQ >= game.getQuizQuestions().size()) {
            return game;
        }

        int correctIndex = game.getQuizCorrectIndices().get(currentQ);
        com.bingo.game.engine.QuizBattleEngine.AnswerResult result =
                quizBattleEngine.submitAnswer(
                        currentQ,
                        correctIndex,
                        answerIndex,
                        senderUserId,
                        game.getQuizAnswers(),
                        game.getPlayers().size(),
                        game.getPlayerScores(),
                        game.getQuizQuestions().size()
                );

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);

        if (result.isRoundComplete()) {
            if (result.isMatchComplete()) {
                int maxScore = game.getPlayerScores().values().stream().mapToInt(Integer::intValue).max().orElse(0);
                long countMax = game.getPlayerScores().values().stream().filter(s -> s == maxScore).count();
                if (countMax > 1) {
                    winnerService.handleGameDraw(game, "Tied score in quiz battle");
                    game = gameRepository.save(game);
                } else {
                    GamePlayer winner = game.findPlayer(result.getMatchWinnerId());
                    winnerService.handleGameFinished(game, winner);
                    game = gameRepository.save(game);
                }
            } else {
                game.setQuizCurrentQuestion(currentQ + 1);
                game.getQuizAnswers().clear();
                game = gameRepository.save(game);
            }

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "QUIZ_ROUND_COMPLETE", Map.of(
                    "questionIndex", currentQ,
                    "correctIndex", correctIndex,
                    "scores", game.getPlayerScores(),
                    "nextQuestionIndex", game.getQuizCurrentQuestion(),
                    "isMatchComplete", result.isMatchComplete()
            ), game.getVersion());
        } else {
            game = gameRepository.save(game);
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "QUIZ_PLAYER_ANSWERED", Map.of(
                    "userId", senderUserId,
                    "questionIndex", currentQ
            ), game.getVersion());
        }

        return game;
    }

    public Game sanitizeGameForPlayer(Game game, String userId) {
        if (game == null) return null;
        if (game.getGameType() != GameType.SHIP_BATTLE) {
            return game;
        }
        if (game.getStatus() == GameStatus.FINISHED) {
            // Match finished: reveal all ship positions
            return game;
        }

        // Mask opponent's fleet coordinates during active setup and battle
        Map<String, List<com.bingo.game.engine.ShipBattleEngine.ShipPlacement>> sanitizedFleets = new HashMap<>();
        if (game.getShipFleets() != null && userId != null && game.getShipFleets().containsKey(userId)) {
            sanitizedFleets.put(userId, game.getShipFleets().get(userId));
        }

        return Game.builder()
                .id(game.getId())
                .roomCode(game.getRoomCode())
                .gameType(game.getGameType())
                .boardSize(game.getBoardSize())
                .winningLines(game.getWinningLines())
                .bingoMode(game.getBingoMode())
                .status(game.getStatus())
                .players(game.getPlayers())
                .currentTurnUserId(game.getCurrentTurnUserId())
                .currentPlayerIndex(game.getCurrentPlayerIndex())
                .moveNumber(game.getMoveNumber())
                .version(game.getVersion())
                .processedMoveIds(game.getProcessedMoveIds())
                .winnerId(game.getWinnerId())
                .startedAt(game.getStartedAt())
                .finishedAt(game.getFinishedAt())
                .shipPhase(game.getShipPhase())
                .shipFleets(sanitizedFleets)
                .shipFleetsLocked(game.getShipFleetsLocked())
                .shipAttacks(game.getShipAttacks())
                .shipSunkTypes(game.getShipSunkTypes())
                .shipLastAttackResult(game.getShipLastAttackResult())
                .build();
    }

    public synchronized Game processShipLockFleet(String senderUserId, String gameId, List<com.bingo.game.engine.ShipBattleEngine.ShipPlacement> fleet, String clientMoveId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate ship lock fleet ignored for clientMoveId: {}", clientMoveId);
                return sanitizeGameForPlayer(game, senderUserId);
            }
        }

        if (game.getStatus() != GameStatus.PLAYING) {
            throw new IllegalStateException("Game is not in PLAYING state (current: " + game.getStatus() + ")");
        }

        GamePlayer player = game.findPlayer(senderUserId);
        if (player == null) {
            throw new IllegalArgumentException("Player not in this game: " + senderUserId);
        }

        if (!"SETUP".equalsIgnoreCase(game.getShipPhase())) {
            throw new IllegalStateException("Fleet setup is already complete");
        }

        if (Boolean.TRUE.equals(game.getShipFleetsLocked().get(senderUserId))) {
            throw new IllegalStateException("Fleet is already locked and cannot be modified");
        }

        // Validate complete fleet placement
        shipBattleEngine.validateFleet(fleet);

        if (game.getShipFleets() == null) {
            game.setShipFleets(new HashMap<>());
        }
        if (game.getShipFleetsLocked() == null) {
            game.setShipFleetsLocked(new HashMap<>());
        }

        game.getShipFleets().put(senderUserId, fleet);
        game.getShipFleetsLocked().put(senderUserId, true);

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            game.getProcessedMoveIds().add(clientMoveId);
        }

        Map<String, Boolean> lockedMap = game.getShipFleetsLocked();
        boolean allLocked = game.getPlayers().size() >= 2;
        for (GamePlayer p : game.getPlayers()) {
            if (!Boolean.TRUE.equals(lockedMap.get(p.getUserId()))) {
                allLocked = false;
                break;
            }
        }

        if (allLocked) {
            game.setShipPhase("BATTLE");
            game.setCurrentPlayerIndex(0);
            game.setCurrentTurnUserId(game.getPlayers().get(0).getUserId());
            game.setVersion(game.getVersion() + 1);
            game = gameRepository.save(game);

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "SHIP_BATTLE_STARTED", Map.of(
                    "gameId", game.getId(),
                    "shipPhase", "BATTLE",
                    "currentTurnUserId", game.getCurrentTurnUserId(),
                    "version", game.getVersion()
            ));
        } else {
            game.setVersion(game.getVersion() + 1);
            game = gameRepository.save(game);

            // Notify room that player has locked their fleet (never leak fleet coordinates!)
            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "SHIP_FLEET_LOCKED", Map.of(
                    "gameId", game.getId(),
                    "userId", senderUserId,
                    "locked", true,
                    "version", game.getVersion()
            ));
        }

        return sanitizeGameForPlayer(game, senderUserId);
    }

    public synchronized Game processShipAttack(String senderUserId, String gameId, int row, int col, String clientMoveId) {
        Game game = gameRepository.findById(gameId)
                .orElseThrow(() -> new IllegalArgumentException("Game not found: " + gameId));

        if (clientMoveId != null && !clientMoveId.isBlank()) {
            if (game.getProcessedMoveIds().contains(clientMoveId)) {
                log.info("Duplicate ship attack ignored for clientMoveId: {}", clientMoveId);
                return sanitizeGameForPlayer(game, senderUserId);
            }
        }

        if (game.getStatus() != GameStatus.PLAYING) {
            throw new IllegalStateException("Game is not in PLAYING state (current: " + game.getStatus() + ")");
        }

        if (!"BATTLE".equalsIgnoreCase(game.getShipPhase())) {
            throw new IllegalStateException("Game is not in BATTLE phase (current: " + game.getShipPhase() + ")");
        }

        GamePlayer attacker = game.findPlayer(senderUserId);
        if (attacker == null) {
            throw new IllegalArgumentException("Player not in this game: " + senderUserId);
        }

        if (!senderUserId.equals(game.getCurrentTurnUserId())) {
            throw new IllegalStateException("Not your turn! Current turn belongs to: " + game.getCurrentTurnUserId());
        }

        GamePlayer defender = game.getPlayers().stream()
                .filter(p -> !p.getUserId().equals(senderUserId))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No opponent player found"));

        List<com.bingo.game.engine.ShipBattleEngine.ShipPlacement> defenderFleet = game.getShipFleets().get(defender.getUserId());
        if (defenderFleet == null || defenderFleet.isEmpty()) {
            throw new IllegalStateException("Defender fleet has not been placed");
        }

        if (game.getShipAttacks() == null) {
            game.setShipAttacks(new HashMap<>());
        }
        List<com.bingo.game.engine.ShipBattleEngine.ShipAttack> attackerAttacks =
                game.getShipAttacks().computeIfAbsent(senderUserId, k -> new ArrayList<>());

        // Process attack
        com.bingo.game.engine.ShipBattleEngine.AttackOutcome outcome =
                shipBattleEngine.processAttack(defenderFleet, attackerAttacks, row, col);

        com.bingo.game.engine.ShipBattleEngine.ShipAttack newAttack = com.bingo.game.engine.ShipBattleEngine.ShipAttack.builder()
                .attackerUserId(senderUserId)
                .row(row)
                .col(col)
                .result(outcome.getResult())
                .sunkShipType(outcome.getSunkShipType())
                .timestamp(System.currentTimeMillis())
                .build();
        attackerAttacks.add(newAttack);

        if (outcome.getResult() == com.bingo.game.engine.ShipBattleEngine.AttackResultType.SUNK && outcome.getSunkShipType() != null) {
            if (game.getShipSunkTypes() == null) {
                game.setShipSunkTypes(new HashMap<>());
            }
            List<String> sunkList = game.getShipSunkTypes().computeIfAbsent(defender.getUserId(), k -> new ArrayList<>());
            if (!sunkList.contains(outcome.getSunkShipType())) {
                sunkList.add(outcome.getSunkShipType());
            }
        }

        game.setMoveNumber(game.getMoveNumber() + 1);
        game.setVersion(game.getVersion() + 1);
        if (clientMoveId != null && !clientMoveId.isBlank()) {
            game.getProcessedMoveIds().add(clientMoveId);
        }

        Map<String, Object> attackDetails = new HashMap<>();
        attackDetails.put("attackerUserId", senderUserId);
        attackDetails.put("defenderUserId", defender.getUserId());
        attackDetails.put("row", row);
        attackDetails.put("col", col);
        attackDetails.put("result", outcome.getResult().name());
        attackDetails.put("sunkShipType", outcome.getSunkShipType() != null ? outcome.getSunkShipType() : "");
        game.setShipLastAttackResult(attackDetails);

        if (outcome.isAllShipsSunk()) {
            // Victory condition: All segments of defender's fleet sunk! Authoritative win
            winnerService.handleGameFinished(game, attacker);
            game = gameRepository.save(game);

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "SHIP_ATTACK_RESULT", Map.of(
                    "gameId", game.getId(),
                    "attackerUserId", senderUserId,
                    "defenderUserId", defender.getUserId(),
                    "row", row,
                    "col", col,
                    "result", outcome.getResult().name(),
                    "sunkShipType", outcome.getSunkShipType() != null ? outcome.getSunkShipType() : "",
                    "nextTurnUserId", "",
                    "allShipsSunk", true,
                    "version", game.getVersion()
            ));
        } else {
            // Alternating turn
            game.setCurrentTurnUserId(defender.getUserId());
            game = gameRepository.save(game);

            gameEventService.publishEvent(game.getRoomCode(), game.getId(), "SHIP_ATTACK_RESULT", Map.of(
                    "gameId", game.getId(),
                    "attackerUserId", senderUserId,
                    "defenderUserId", defender.getUserId(),
                    "row", row,
                    "col", col,
                    "result", outcome.getResult().name(),
                    "sunkShipType", outcome.getSunkShipType() != null ? outcome.getSunkShipType() : "",
                    "nextTurnUserId", defender.getUserId(),
                    "allShipsSunk", false,
                    "version", game.getVersion()
            ));
        }

        return sanitizeGameForPlayer(game, senderUserId);
    }
}
