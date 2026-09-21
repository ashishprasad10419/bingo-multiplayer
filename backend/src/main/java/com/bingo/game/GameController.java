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
        return ResponseEntity.ok(gameService.processTttMove(userId, id, request.getRow(), request.getCol(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/dots-and-boxes/line")
    @Operation(summary = "Draw a line in Dots & Boxes (REST fallback for WebSocket)")
    public ResponseEntity<Game> drawDotsLine(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.DotsLineRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processDotsLine(userId, id, request.getLineType(), request.getRow(), request.getCol(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/c4/move")
    @Operation(summary = "Make a Connect Four move (REST fallback)")
    public ResponseEntity<Game> makeC4Move(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processC4Move(userId, id, request.getCol(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/rps/choice")
    @Operation(summary = "Submit Rock Paper Scissors choice (REST fallback)")
    public ResponseEntity<Game> submitRpsChoice(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processRpsChoice(userId, id, request.getChoice(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/memory/flip")
    @Operation(summary = "Flip a card in Memory (REST fallback)")
    public ResponseEntity<Game> flipMemoryCard(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processMemoryFlip(userId, id, request.getCardIndex(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/number-rush/tap")
    @Operation(summary = "Tap number in Number Rush (REST fallback)")
    public ResponseEntity<Game> tapNumberRush(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processNumberRushTap(userId, id, request.getTappedNumber(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/word-scramble/guess")
    @Operation(summary = "Submit guess in Word Scramble (REST fallback)")
    public ResponseEntity<Game> guessWordScramble(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processWordScrambleGuess(userId, id, request.getGuess(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/quiz/answer")
    @Operation(summary = "Submit answer in Quiz Battle (REST fallback)")
    public ResponseEntity<Game> submitQuizAnswer(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processQuizAnswer(userId, id, request.getAnswerIndex(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/ship/lock-fleet")
    @Operation(summary = "Lock fleet placement in Ship Battle (REST fallback)")
    public ResponseEntity<Game> lockShipFleet(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.ShipLockFleetRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processShipLockFleet(userId, id, request.getFleet(), request.getClientMoveId()));
    }

    @PostMapping("/games/{id}/ship/attack")
    @Operation(summary = "Fire attack against opponent board in Ship Battle (REST fallback)")
    public ResponseEntity<Game> makeShipAttack(
            @PathVariable String id,
            @RequestBody com.bingo.game.dto.GenericMoveRequest request,
            @AuthenticationPrincipal String userId
    ) {
        return ResponseEntity.ok(gameService.processShipAttack(userId, id, request.getRow(), request.getCol(), request.getClientMoveId()));
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
