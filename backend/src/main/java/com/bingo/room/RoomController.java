package com.bingo.room;

import com.bingo.board.BoardService;
import com.bingo.board.dto.LockBoardRequest;
import com.bingo.board.dto.SwapCellsRequest;
import com.bingo.game.Game;
import com.bingo.room.dto.CreateRoomRequest;
import com.bingo.room.dto.JoinRoomRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@Tag(name = "Rooms & Board Setup", description = "Room lifecycle and board customization endpoints")
public class RoomController {

    private final RoomService roomService;
    private final BoardService boardService;

    @PostMapping
    @Operation(summary = "Create a new game room")
    public ResponseEntity<Room> createRoom(
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) CreateRoomRequest request
    ) {
        CreateRoomRequest req = request != null ? request : new CreateRoomRequest();
        return ResponseEntity.ok(roomService.createRoom(userId, req));
    }

    @PostMapping("/{code}/join")
    @Operation(summary = "Join an existing room by code")
    public ResponseEntity<Room> joinRoom(
            @PathVariable String code,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) JoinRoomRequest request
    ) {
        JoinRoomRequest req = request != null ? request : new JoinRoomRequest();
        return ResponseEntity.ok(roomService.joinRoom(code, userId, req));
    }

    @GetMapping("/{code}")
    @Operation(summary = "Get current room lobby state")
    public ResponseEntity<Room> getRoom(@PathVariable String code) {
        return ResponseEntity.ok(roomService.getRoomByCode(code));
    }

    @PostMapping("/{code}/leave")
    @Operation(summary = "Leave a room")
    public ResponseEntity<Map<String, String>> leaveRoom(
            @PathVariable String code,
            @AuthenticationPrincipal String userId
    ) {
        roomService.leaveRoom(code, userId);
        return ResponseEntity.ok(Map.of("message", "Left room successfully"));
    }

    @PostMapping("/{code}/board/generate")
    @Operation(summary = "Generate a randomized 5x5 board for player")
    public ResponseEntity<List<List<Integer>>> generateBoard(
            @PathVariable String code,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(boardService.generateBoard(code, userId));
    }

    @PostMapping("/{code}/board/shuffle")
    @Operation(summary = "Shuffle player's board")
    public ResponseEntity<List<List<Integer>>> shuffleBoard(
            @PathVariable String code,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(boardService.shuffleBoard(code, userId));
    }

    @PostMapping("/{code}/board/swap")
    @Operation(summary = "Swap two cells on player's board")
    public ResponseEntity<List<List<Integer>>> swapCells(
            @PathVariable String code,
            @AuthenticationPrincipal String userId,
            @Valid @RequestBody SwapCellsRequest request
    ) {
        return ResponseEntity.ok(boardService.swapCells(code, userId, request));
    }

    @PostMapping("/{code}/board/lock")
    @Operation(summary = "Validate and lock player's board")
    public ResponseEntity<Map<String, Boolean>> lockBoard(
            @PathVariable String code,
            @AuthenticationPrincipal String userId,
            @RequestBody(required = false) LockBoardRequest request
    ) {
        boolean locked = boardService.lockBoard(code, userId, request);
        return ResponseEntity.ok(Map.of("locked", locked));
    }

    @PostMapping("/{code}/ready")
    @Operation(summary = "Toggle player ready state")
    public ResponseEntity<Room> toggleReady(
            @PathVariable String code,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(roomService.toggleReady(code, userId));
    }

    @PostMapping("/{code}/start")
    @Operation(summary = "Host starts the game once all players are locked & ready")
    public ResponseEntity<Game> startGame(
            @PathVariable String code,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(roomService.startGame(code, userId));
    }
}
