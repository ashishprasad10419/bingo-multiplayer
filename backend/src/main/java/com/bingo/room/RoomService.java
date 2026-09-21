package com.bingo.room;

import com.bingo.board.BoardService;
import com.bingo.game.Game;
import com.bingo.game.GamePlayer;
import com.bingo.game.GameRepository;
import com.bingo.game.GameStatus;
import com.bingo.room.dto.CreateRoomRequest;
import com.bingo.room.dto.JoinRoomRequest;
import com.bingo.user.User;
import com.bingo.user.UserRepository;
import com.bingo.websocket.GameEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final GameRepository gameRepository;
    private final GameEventService gameEventService;
    private final BoardService boardService;
    private final com.bingo.game.WinnerService winnerService;
    private final com.bingo.game.engine.MemoryEngine memoryEngine;
    private final com.bingo.game.engine.NumberRushEngine numberRushEngine;
    private final com.bingo.game.engine.WordScrambleEngine wordScrambleEngine;
    private final com.bingo.game.engine.QuizBattleEngine quizBattleEngine;

    private static final String ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    public Room createRoom(String hostUserId, CreateRoomRequest request) {
        User host = userRepository.findById(hostUserId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + hostUserId));

        // Close any previously unstarted rooms created by this host
        List<Room> activeHostRooms = roomRepository.findByHostIdAndStatusIn(
                hostUserId, List.of(RoomStatus.WAITING, RoomStatus.BOARD_SETUP, RoomStatus.READY)
        );
        for (Room oldRoom : activeHostRooms) {
            oldRoom.setStatus(RoomStatus.CANCELLED);
            roomRepository.save(oldRoom);
            gameEventService.publishEvent(oldRoom.getRoomCode(), null, "ROOM_CLOSED", Map.of("reason", "Host created another room"));
        }

        String roomCode = generateUniqueRoomCode();
        com.bingo.game.GameType gameType = request.getGameType() != null ? request.getGameType() : com.bingo.game.GameType.BINGO;

        if (gameType == com.bingo.game.GameType.QUIZ_BATTLE) {
            throw new IllegalArgumentException("Trivia Showdown game is no longer available");
        }

        int boardSize = 5;
        int winningLines = 5;
        int maxPlayers = 6;

        if (gameType == com.bingo.game.GameType.TIC_TAC_TOE) {
            maxPlayers = 2;
            boardSize = (request.getGridSize() != null && request.getGridSize() >= 3 && request.getGridSize() <= 5) ? request.getGridSize() : 3;
            winningLines = boardSize;
        } else if (gameType == com.bingo.game.GameType.DOTS_AND_BOXES) {
            maxPlayers = (request.getMaxPlayers() != null && request.getMaxPlayers() >= 2 && request.getMaxPlayers() <= 4) ? request.getMaxPlayers() : 4;
            boardSize = (request.getGridSize() != null && request.getGridSize() >= 3 && request.getGridSize() <= 5) ? request.getGridSize() : 4;
        } else if (gameType == com.bingo.game.GameType.SHIP_BATTLE) {
            maxPlayers = 2;
            boardSize = 8;
            winningLines = 5;
        } else {
            // BINGO
            String bingoMode = request.getBingoMode() != null ? request.getBingoMode().toUpperCase() : "CLASSIC";
            boardSize = (request.getBoardSize() != null && request.getBoardSize() >= 5 && request.getBoardSize() <= 10) ? request.getBoardSize() : 5;
            if ("SPEED".equalsIgnoreCase(bingoMode)) {
                winningLines = 3;
            } else if ("BLACKOUT".equalsIgnoreCase(bingoMode)) {
                winningLines = boardSize * boardSize;
            } else {
                winningLines = (request.getWinningLines() != null && request.getWinningLines() > 0 && request.getWinningLines() <= boardSize) ? request.getWinningLines() : boardSize;
            }
            maxPlayers = (request.getMaxPlayers() != null && request.getMaxPlayers() >= 2 && request.getMaxPlayers() <= 6) ? request.getMaxPlayers() : 6;
        }

        String bingoMode = (request.getBingoMode() != null) ? request.getBingoMode().toUpperCase() : "CLASSIC";
        boolean autoLock = (gameType != com.bingo.game.GameType.BINGO);

        RoomPlayer hostPlayer = RoomPlayer.builder()
                .userId(host.getId())
                .username(host.getUsername())
                .avatar(host.getAvatar())
                .isGuest(host.isGuest())
                .ready(autoLock)
                .boardLocked(autoLock)
                .build();

        Room room = Room.builder()
                .roomCode(roomCode)
                .hostId(host.getId())
                .status(RoomStatus.WAITING)
                .gameType(gameType)
                .bingoMode(bingoMode)
                .boardSize(boardSize)
                .winningLines(winningLines)
                .maxPlayers(maxPlayers)
                .players(new ArrayList<>(List.of(hostPlayer)))
                .allowMatchmaking(false)
                .createdAt(Instant.now())
                .build();

        room = roomRepository.save(room);

        // Pre-generate a board for host only if Bingo
        if (gameType == com.bingo.game.GameType.BINGO) {
            boardService.generateBoard(roomCode, hostUserId);
        }

        return roomRepository.findByRoomCode(roomCode).orElse(room);
    }

    public Room joinRoom(String roomCode, String userId, JoinRoomRequest request) {
        Room room = getRoomByCode(roomCode);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        if (room.getStatus() == RoomStatus.PLAYING || room.getStatus() == RoomStatus.FINISHED) {
            throw new IllegalStateException("Game is already in progress or finished");
        }

        RoomPlayer existingPlayer = room.findPlayerData(userId);
        if (existingPlayer != null) {
            return room; // Player already in room
        }

        if (room.getPlayers().size() >= room.getMaxPlayers()) {
            throw new IllegalStateException("Room is full (max " + room.getMaxPlayers() + " players)");
        }

        boolean autoLock = (room.getGameType() != com.bingo.game.GameType.BINGO);

        RoomPlayer newPlayer = RoomPlayer.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .isGuest(user.isGuest())
                .ready(autoLock)
                .boardLocked(autoLock)
                .build();

        room.getPlayers().add(newPlayer);
        room = roomRepository.save(room);

        // Pre-generate initial board for new player only if Bingo
        if (room.getGameType() == com.bingo.game.GameType.BINGO) {
            boardService.generateBoard(roomCode, userId);
        }
        room = roomRepository.findByRoomCode(roomCode).orElse(room);

        // Broadcast PLAYER_JOINED event
        gameEventService.publishEvent(roomCode, null, "PLAYER_JOINED", Map.of(
                "userId", user.getId(),
                "username", user.getUsername(),
                "avatar", user.getAvatar(),
                "isGuest", user.isGuest()
        ));

        return room;
    }

    public Room getRoomByCode(String roomCode) {
        return roomRepository.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Room not found: " + roomCode));
    }

    public void leaveRoom(String roomCode, String userId) {
        Room room = getRoomByCode(roomCode);
        boolean removed = room.getPlayers().removeIf(p -> p.getUserId().equals(userId));

        if (!removed) return;

        if (room.getPlayers().isEmpty()) {
            room.setStatus(RoomStatus.CANCELLED);
            roomRepository.save(room);
            gameRepository.findByRoomCodeAndStatus(roomCode, com.bingo.game.GameStatus.PLAYING).ifPresent(game -> {
                game.setStatus(com.bingo.game.GameStatus.ABANDONED);
                gameRepository.save(game);
            });
            return;
        }

        // Check if game is currently in progress: remaining player wins by forfeit
        gameRepository.findByRoomCodeAndStatus(roomCode, com.bingo.game.GameStatus.PLAYING).ifPresent(game -> {
            if (room.getPlayers().size() == 1) {
                RoomPlayer remaining = room.getPlayers().get(0);
                com.bingo.game.GamePlayer winner = game.findPlayer(remaining.getUserId());
                if (winner != null) {
                    log.info("Player {} forfeited room {}. Winner: {}", userId, roomCode, winner.getUsername());
                    winnerService.handleGameFinished(game, winner);
                    gameRepository.save(game);
                }
            }
        });

        // Host transfer logic if host leaves
        if (room.getHostId().equals(userId)) {
            RoomPlayer newHost = room.getPlayers().get(0);
            room.setHostId(newHost.getUserId());
            log.info("Transferred host of room {} to user {}", roomCode, newHost.getUsername());
        }

        roomRepository.save(room);

        gameEventService.publishEvent(roomCode, null, "PLAYER_LEFT", Map.of(
                "userId", userId,
                "newHostId", room.getHostId()
        ));
    }

    public Room toggleReady(String roomCode, String userId) {
        Room room = getRoomByCode(roomCode);
        RoomPlayer player = room.findPlayerData(userId);
        if (player == null) {
            throw new IllegalArgumentException("User not in room");
        }

        if (!player.isBoardLocked()) {
            throw new IllegalStateException("You must lock your board before marking ready");
        }

        player.setReady(!player.isReady());
        room = roomRepository.save(room);

        gameEventService.publishEvent(roomCode, null,
                player.isReady() ? "PLAYER_READY" : "PLAYER_NOT_READY",
                Map.of("userId", userId, "ready", player.isReady())
        );

        return room;
    }

    public Game startGame(String roomCode, String hostUserId) {
        Room room = getRoomByCode(roomCode);

        if (!room.getHostId().equals(hostUserId)) {
            throw new IllegalStateException("Only the room host can start the game");
        }

        if (room.getPlayers().size() < 2) {
            throw new IllegalStateException("At least 2 players are required to start a game");
        }

        for (RoomPlayer player : room.getPlayers()) {
            if (room.getGameType() == com.bingo.game.GameType.BINGO && (!player.isBoardLocked() || player.getBoard() == null)) {
                throw new IllegalStateException("All players must lock their boards before starting");
            }
        }

        room.setStatus(RoomStatus.PLAYING);
        roomRepository.save(room);

        // Create Game document
        List<GamePlayer> gamePlayers = new ArrayList<>();
        for (RoomPlayer rp : room.getPlayers()) {
            gamePlayers.add(GamePlayer.builder()
                    .userId(rp.getUserId())
                    .username(rp.getUsername())
                    .avatar(rp.getAvatar())
                    .isGuest(rp.isGuest())
                    .board(rp.getBoard())
                    .locked(true)
                    .lineCount(0)
                    .build());
        }

        // Shuffle player turn order at start
        Collections.shuffle(gamePlayers);

        Game.GameBuilder gameBuilder = Game.builder()
                .roomCode(room.getRoomCode())
                .gameType(room.getGameType())
                .bingoMode(room.getBingoMode() != null ? room.getBingoMode() : "CLASSIC")
                .boardSize(room.getBoardSize())
                .winningLines(room.getWinningLines())
                .status(GameStatus.PLAYING)
                .players(gamePlayers)
                .currentPlayerIndex(0)
                .currentTurnUserId(gamePlayers.get(0).getUserId())
                .moveNumber(0)
                .startedAt(Instant.now());

        if (room.getGameType() == com.bingo.game.GameType.TIC_TAC_TOE) {
            int tttSize = room.getBoardSize();
            gameBuilder.tttGridSize(tttSize);
            gameBuilder.tttBoard(new ArrayList<>(Collections.nCopies(tttSize * tttSize, "")));
        } else if (room.getGameType() == com.bingo.game.GameType.DOTS_AND_BOXES) {
            int dotsSize = room.getBoardSize();
            gameBuilder.dotsGridSize(dotsSize);
            gameBuilder.horizontalLines(new ArrayList<>());
            gameBuilder.verticalLines(new ArrayList<>());
            gameBuilder.completedBoxes(new HashMap<>());
            gameBuilder.lineOwners(new HashMap<>());
            Map<String, Integer> initialScores = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                initialScores.put(gp.getUserId(), 0);
            }
            gameBuilder.playerScores(initialScores);
        } else if (room.getGameType() == com.bingo.game.GameType.CONNECT_FOUR) {
            gameBuilder.c4Cols(7);
            gameBuilder.c4Rows(6);
            gameBuilder.c4Board(new ArrayList<>(Collections.nCopies(42, "")));
            gameBuilder.c4WinningCells(new ArrayList<>());
        } else if (room.getGameType() == com.bingo.game.GameType.ROCK_PAPER_SCISSORS) {
            gameBuilder.rpsRound(1);
            gameBuilder.rpsTargetWins(3);
            gameBuilder.rpsChoices(new HashMap<>());
            Map<String, Integer> wins = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                wins.put(gp.getUserId(), 0);
            }
            gameBuilder.rpsRoundWins(wins);
            gameBuilder.rpsLastRoundResult(new HashMap<>());
        } else if (room.getGameType() == com.bingo.game.GameType.MEMORY) {
            gameBuilder.memoryCards(memoryEngine.initializeDeck());
            gameBuilder.memoryMatched(new ArrayList<>(Collections.nCopies(16, false)));
            gameBuilder.memoryFlippedIndices(new ArrayList<>());
            Map<String, Integer> initialScores = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                initialScores.put(gp.getUserId(), 0);
            }
            gameBuilder.playerScores(initialScores);
        } else if (room.getGameType() == com.bingo.game.GameType.NUMBER_RUSH) {
            Map<String, List<Integer>> boards = new HashMap<>();
            Map<String, Integer> progress = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                boards.put(gp.getUserId(), numberRushEngine.generateShuffledBoard());
                progress.put(gp.getUserId(), 1);
            }
            gameBuilder.numberRushBoards(boards);
            gameBuilder.numberRushProgress(progress);
        } else if (room.getGameType() == com.bingo.game.GameType.WORD_SCRAMBLE) {
            List<com.bingo.game.engine.WordScrambleEngine.WordEntry> words = wordScrambleEngine.pickRandomWords(5);
            List<String> rawWords = new ArrayList<>();
            List<String> hints = new ArrayList<>();
            List<String> jumbled = new ArrayList<>();
            for (com.bingo.game.engine.WordScrambleEngine.WordEntry we : words) {
                rawWords.add(we.word());
                hints.add(we.hint());
                jumbled.add(wordScrambleEngine.scrambleWord(we.word()));
            }
            gameBuilder.scrambleWords(rawWords);
            gameBuilder.scrambleHints(hints);
            gameBuilder.scrambleJumbled(jumbled);
            gameBuilder.scrambleCurrentRound(0);
            Map<String, Integer> initialScores = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                initialScores.put(gp.getUserId(), 0);
            }
            gameBuilder.playerScores(initialScores);
        } else if (room.getGameType() == com.bingo.game.GameType.QUIZ_BATTLE) {
            List<com.bingo.game.engine.QuizBattleEngine.QuizItem> quizItems = quizBattleEngine.pickRandomQuestions(5);
            List<String> questions = new ArrayList<>();
            List<List<String>> options = new ArrayList<>();
            List<Integer> corrects = new ArrayList<>();
            for (com.bingo.game.engine.QuizBattleEngine.QuizItem item : quizItems) {
                questions.add(item.question());
                options.add(item.options());
                corrects.add(item.correctIndex());
            }
            gameBuilder.quizQuestions(questions);
            gameBuilder.quizOptions(options);
            gameBuilder.quizCorrectIndices(corrects);
            gameBuilder.quizCurrentQuestion(0);
            gameBuilder.quizAnswers(new HashMap<>());
            Map<String, Integer> initialScores = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                initialScores.put(gp.getUserId(), 0);
            }
            gameBuilder.playerScores(initialScores);
        } else if (room.getGameType() == com.bingo.game.GameType.SHIP_BATTLE) {
            gameBuilder.boardSize(8);
            gameBuilder.shipPhase("SETUP");
            gameBuilder.shipFleets(new HashMap<>());
            Map<String, Boolean> lockedMap = new HashMap<>();
            Map<String, List<com.bingo.game.engine.ShipBattleEngine.ShipAttack>> attacksMap = new HashMap<>();
            Map<String, List<String>> sunkMap = new HashMap<>();
            for (GamePlayer gp : gamePlayers) {
                lockedMap.put(gp.getUserId(), false);
                attacksMap.put(gp.getUserId(), new ArrayList<>());
                sunkMap.put(gp.getUserId(), new ArrayList<>());
            }
            gameBuilder.shipFleetsLocked(lockedMap);
            gameBuilder.shipAttacks(attacksMap);
            gameBuilder.shipSunkTypes(sunkMap);
            gameBuilder.shipLastAttackResult(new HashMap<>());
        } else {
            gameBuilder.calledNumbers(new ArrayList<>());
        }

        Game game = gameBuilder.build();

        game = gameRepository.save(game);

        // Broadcast GAME_STARTED event
        gameEventService.publishEvent(roomCode, game.getId(), "GAME_STARTED", Map.of(
                "gameId", game.getId(),
                "players", gamePlayers,
                "firstTurnUserId", game.getCurrentTurnUserId()
        ));

        return game;
    }

    public Map<String, Object> rematch(String roomCode, String userId) {
        Room room = getRoomByCode(roomCode);
        boolean isBingo = (room.getGameType() == com.bingo.game.GameType.BINGO);

        if (isBingo) {
            room.setStatus(RoomStatus.BOARD_SETUP);
            for (RoomPlayer rp : room.getPlayers()) {
                rp.setReady(false);
                rp.setBoardLocked(false);
                boardService.generateBoard(roomCode, rp.getUserId());
            }
            room = roomRepository.save(room);

            gameEventService.publishEvent(roomCode, null, "REMATCH_STARTED", Map.of(
                    "roomCode", roomCode,
                    "gameType", room.getGameType(),
                    "status", "BOARD_SETUP"
            ));

            return Map.of(
                    "roomCode", roomCode,
                    "gameType", room.getGameType(),
                    "status", "BOARD_SETUP"
            );
        } else {
            room.setStatus(RoomStatus.READY);
            for (RoomPlayer rp : room.getPlayers()) {
                rp.setReady(true);
                rp.setBoardLocked(true);
            }
            room = roomRepository.save(room);

            Game newGame = startGame(roomCode, room.getHostId());

            gameEventService.publishEvent(roomCode, newGame.getId(), "REMATCH_STARTED", Map.of(
                    "roomCode", roomCode,
                    "gameType", room.getGameType(),
                    "newGameId", newGame.getId(),
                    "status", "PLAYING"
            ));

            return Map.of(
                    "roomCode", roomCode,
                    "gameType", room.getGameType(),
                    "newGameId", newGame.getId(),
                    "status", "PLAYING"
            );
        }
    }

    public Room quickPlay(String userId, com.bingo.room.dto.QuickPlayRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        com.bingo.game.GameType gameType = (request != null && request.getGameType() != null)
                ? request.getGameType()
                : com.bingo.game.GameType.BINGO;

        String bingoMode = (request != null && request.getBingoMode() != null)
                ? request.getBingoMode().toUpperCase()
                : "CLASSIC";

        // 1. Look for existing open WAITING room for this game type with available slots and allowMatchmaking enabled
        List<Room> openRooms = roomRepository.findByStatusAndGameTypeAndAllowMatchmakingTrue(RoomStatus.WAITING, gameType);
        for (Room room : openRooms) {
            if (room.getPlayers().size() < room.getMaxPlayers() && room.findPlayerData(userId) == null) {
                // If Bingo, check mode match if specified
                if (gameType == com.bingo.game.GameType.BINGO && room.getBingoMode() != null) {
                    if (!room.getBingoMode().equalsIgnoreCase(bingoMode)) {
                        continue;
                    }
                }
                return joinRoom(room.getRoomCode(), userId, new com.bingo.room.dto.JoinRoomRequest());
            }
        }

        // 2. No open room found: auto-create a standard room for quick match with allowMatchmaking enabled
        CreateRoomRequest createReq = new CreateRoomRequest();
        createReq.setGameType(gameType);
        createReq.setBingoMode(bingoMode);

        if (gameType == com.bingo.game.GameType.TIC_TAC_TOE) {
            createReq.setMaxPlayers(2);
            createReq.setGridSize(3);
        } else if (gameType == com.bingo.game.GameType.DOTS_AND_BOXES) {
            createReq.setMaxPlayers(2);
            createReq.setGridSize(4);
        } else if (gameType == com.bingo.game.GameType.SHIP_BATTLE) {
            createReq.setMaxPlayers(2);
            createReq.setBoardSize(8);
            createReq.setWinningLines(5);
        } else {
            createReq.setMaxPlayers(4);
            createReq.setBoardSize(5);
            if ("SPEED".equalsIgnoreCase(bingoMode)) {
                createReq.setWinningLines(3);
            } else if ("BLACKOUT".equalsIgnoreCase(bingoMode)) {
                createReq.setWinningLines(25);
            } else {
                createReq.setWinningLines(5);
            }
        }

        Room room = createRoom(userId, createReq);
        room.setAllowMatchmaking(true);
        return roomRepository.save(room);
    }

    private String generateUniqueRoomCode() {
        for (int attempt = 0; attempt < 100; attempt++) {
            StringBuilder sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(ROOM_CODE_CHARS.charAt(RANDOM.nextInt(ROOM_CODE_CHARS.length())));
            }
            String code = sb.toString();
            if (!roomRepository.existsByRoomCode(code)) {
                return code;
            }
        }
        return UUID.randomUUID().toString().substring(0, 6).toUpperCase();
    }
}
