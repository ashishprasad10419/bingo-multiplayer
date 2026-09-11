package com.bingo.game;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Game", description = "Authoritative game state and player history")
public class GameController {

    private final GameService gameService;

    @GetMapping("/games/{id}")
    @Operation(summary = "Get full authoritative game state by ID (used for state sync and reconnects)")
    public ResponseEntity<Game> getGame(
            @PathVariable String id,
            @AuthenticationPrincipal String userId
    ) {
        Game game = gameService.handlePlayerReconnect(id, userId);
        return ResponseEntity.ok(game);
    }

    @GetMapping("/games/room/{roomCode}")
    @Operation(summary = "Get active game state by roomCode (for page refresh/reconnect from /game/:roomCode)")
    public ResponseEntity<Game> getGameByRoom(
            @PathVariable String roomCode,
            @AuthenticationPrincipal String userId
    ) {
        Game game = gameService.getGameByRoomCode(roomCode, userId);
        return ResponseEntity.ok(game);
    }

    @PostMapping("/games/{id}/call")
    @Operation(summary = "Call a number (REST fallback for WebSocket)")
    public ResponseEntity<Game> callNumber(
            @PathVariable String id,
            @RequestParam int number,
            @AuthenticationPrincipal String userId
    ) {
        com.bingo.game.dto.CallNumberRequest request = new com.bingo.game.dto.CallNumberRequest(id, number);
        return ResponseEntity.ok(gameService.processCallNumber(userId, request));
    }

    @PostMapping("/games/{id}/tic-tac-toe/move")
    @Operation(summary = "Make a Tic-Tac-Toe move (REST fallback for WebSocket)")
    public ResponseEntity<Game> makeTttMove(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.TttMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processTttMove(userId, id, request.getRow(), request.getCol()));
    }

    @PostMapping("/games/{id}/dots-and-boxes/line")
    @Operation(summary = "Draw a line in Dots & Boxes (REST fallback for WebSocket)")
    public ResponseEntity<Game> drawDotsLine(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.DotsLineRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processDotsLine(userId, id, request.getLineType(), request.getRow(), request.getCol()));
    }

    @PostMapping("/games/{id}/emote")
    @Operation(summary = "Send an in-game reaction emote (REST fallback)")
    public ResponseEntity<Void> sendEmote(
            @PathVariable String id,
            @RequestParam String emote,
            @AuthenticationPrincipal String userId
    ) {
        gameService.broadcastEmote(userId, id, emote);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users/me/games")
    @Operation(summary = "Get game history for the currently authenticated player")
    public ResponseEntity<List<GameHistory>> getMyGameHistory(
            @AuthenticationPrincipal String userId,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(gameService.getUserGameHistory(userId, limit));
    }
}
