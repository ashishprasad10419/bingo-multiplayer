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
        int boardSize = (request.getBoardSize() != null && request.getBoardSize() == 5) ? 5 : 5;
        int winningLines = (request.getWinningLines() != null && request.getWinningLines() > 0) ? request.getWinningLines() : 5;
        int maxPlayers = (request.getMaxPlayers() != null && request.getMaxPlayers() >= 2 && request.getMaxPlayers() <= 6) ? request.getMaxPlayers() : 6;

        RoomPlayer hostPlayer = RoomPlayer.builder()
                .userId(host.getId())
                .username(host.getUsername())
                .avatar(host.getAvatar())
                .isGuest(host.isGuest())
                .ready(false)
                .boardLocked(false)
                .build();

        Room room = Room.builder()
                .roomCode(roomCode)
                .hostId(host.getId())
                .status(RoomStatus.WAITING)
                .boardSize(boardSize)
                .winningLines(winningLines)
                .maxPlayers(maxPlayers)
                .players(new ArrayList<>(List.of(hostPlayer)))
                .createdAt(Instant.now())
                .build();

        room = roomRepository.save(room);

        // Pre-generate a board for host
        boardService.generateBoard(roomCode, hostUserId);

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

        RoomPlayer newPlayer = RoomPlayer.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .avatar(user.getAvatar())
                .isGuest(user.isGuest())
                .ready(false)
                .boardLocked(false)
                .build();

        room.getPlayers().add(newPlayer);
        room = roomRepository.save(room);

        // Pre-generate initial board for new player
        boardService.generateBoard(roomCode, userId);
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
            return;
        }

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
            if (!player.isBoardLocked() || player.getBoard() == null) {
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

        Game game = Game.builder()
                .roomCode(room.getRoomCode())
                .boardSize(room.getBoardSize())
                .winningLines(room.getWinningLines())
                .status(GameStatus.PLAYING)
                .players(gamePlayers)
                .calledNumbers(new ArrayList<>())
                .currentPlayerIndex(0)
                .currentTurnUserId(gamePlayers.get(0).getUserId())
                .moveNumber(0)
                .startedAt(Instant.now())
                .build();

        game = gameRepository.save(game);

        // Broadcast GAME_STARTED event
        gameEventService.publishEvent(roomCode, game.getId(), "GAME_STARTED", Map.of(
                "gameId", game.getId(),
                "players", gamePlayers,
                "firstTurnUserId", game.getCurrentTurnUserId()
        ));

        return game;
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
