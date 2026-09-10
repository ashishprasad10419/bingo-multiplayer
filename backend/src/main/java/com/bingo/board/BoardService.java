package com.bingo.board;

import com.bingo.board.dto.LockBoardRequest;
import com.bingo.board.dto.SwapCellsRequest;
import com.bingo.game.GameEngine;
import com.bingo.room.Room;
import com.bingo.room.RoomPlayer;
import com.bingo.room.RoomRepository;
import com.bingo.room.RoomStatus;
import com.bingo.websocket.GameEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BoardService {

    private final RoomRepository roomRepository;
    private final GameEngine gameEngine;
    private final BoardValidator boardValidator;
    private final GameEventService gameEventService;

    public List<List<Integer>> generateBoard(String roomCode, String userId) {
        Room room = findRoom(roomCode);
        checkLobbyEditable(room);

        RoomPlayer player = getPlayer(room, userId);
        if (player.isBoardLocked()) {
            throw new IllegalStateException("Board is already locked");
        }

        List<List<Integer>> board = gameEngine.generateRandomBoard(room.getBoardSize());
        player.setBoard(board);
        roomRepository.save(room);

        return board;
    }

    public List<List<Integer>> shuffleBoard(String roomCode, String userId) {
        return generateBoard(roomCode, userId);
    }

    public List<List<Integer>> swapCells(String roomCode, String userId, SwapCellsRequest request) {
        Room room = findRoom(roomCode);
        checkLobbyEditable(room);

        RoomPlayer player = getPlayer(room, userId);
        if (player.isBoardLocked()) {
            throw new IllegalStateException("Board is already locked and cannot be edited");
        }

        if (player.getBoard() == null) {
            player.setBoard(gameEngine.generateRandomBoard(room.getBoardSize()));
        }

        List<List<Integer>> updated = gameEngine.swapCells(
                player.getBoard(),
                request.getPosition1().getRow(),
                request.getPosition1().getColumn(),
                request.getPosition2().getRow(),
                request.getPosition2().getColumn(),
                room.getBoardSize()
        );

        player.setBoard(updated);
        roomRepository.save(room);
        return updated;
    }

    public boolean lockBoard(String roomCode, String userId, LockBoardRequest request) {
        Room room = findRoom(roomCode);
        checkLobbyEditable(room);

        RoomPlayer player = getPlayer(room, userId);
        if (player.isBoardLocked()) {
            return true;
        }

        List<List<Integer>> candidateBoard = (request != null && request.getBoard() != null)
                ? request.getBoard()
                : player.getBoard();

        if (candidateBoard == null) {
            candidateBoard = gameEngine.generateRandomBoard(room.getBoardSize());
        }

        boardValidator.validateBoardOrThrow(candidateBoard, room.getBoardSize());

        player.setBoard(candidateBoard);
        player.setBoardLocked(true);
        player.setReady(true);
        roomRepository.save(room);

        // Broadcast to room
        gameEventService.publishEvent(roomCode, null, "BOARD_LOCKED", Map.of(
                "userId", userId,
                "username", player.getUsername()
        ));

        gameEventService.publishEvent(roomCode, null, "PLAYER_READY", Map.of(
                "userId", userId,
                "ready", true
        ));

        return true;
    }

    private Room findRoom(String roomCode) {
        return roomRepository.findByRoomCode(roomCode.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Room not found with code: " + roomCode));
    }

    private RoomPlayer getPlayer(Room room, String userId) {
        RoomPlayer player = room.findPlayerData(userId);
        if (player == null) {
            throw new IllegalArgumentException("User is not in room: " + userId);
        }
        return player;
    }

    private void checkLobbyEditable(Room room) {
        if (room.getStatus() == RoomStatus.PLAYING || room.getStatus() == RoomStatus.FINISHED) {
            throw new IllegalStateException("Game has already started or finished");
        }
    }
}
