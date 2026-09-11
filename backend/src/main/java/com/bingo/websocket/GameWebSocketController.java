package com.bingo.websocket;

import com.bingo.game.Game;
import com.bingo.game.GameService;
import com.bingo.game.dto.CallNumberRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Slf4j
@Controller
@RequiredArgsConstructor
public class GameWebSocketController {

    private final GameService gameService;
    private final GameEventService gameEventService;

    @MessageMapping("/game/call-number")
    public void handleCallNumber(@Payload CallNumberRequest request, Principal principal) {
        if (principal == null) {
            log.warn("Unauthorized call-number attempt");
            return;
        }

        String userId = principal.getName();
        log.info("Received call-number: user={} gameId={} number={}", userId, request.getGameId(), request.getNumber());

        try {
            gameService.processCallNumber(userId, request);
        } catch (Exception ex) {
            log.warn("Notice: call number rejected/collision ({}): {}", userId, ex.getMessage());
            // In case of turn collision or fast double-clicks, broadcast latest authoritative turn state so all clients resync
            try {
                Game game = gameService.getGameById(request.getGameId());
                gameEventService.publishEvent(game.getRoomCode(), game.getId(), "TURN_CHANGED", java.util.Map.of(
                        "currentTurnUserId", game.getCurrentTurnUserId(),
                        "calledNumbers", game.getCalledNumbers(),
                        "moves", game.getMoves() != null ? game.getMoves() : java.util.List.of()
                ));
            } catch (Exception ignored) {
            }
        }
    }

    @MessageMapping("/game/send-emote")
    public void handleSendEmote(@Payload com.bingo.game.dto.SendEmoteRequest request, Principal principal) {
        if (principal == null) {
            log.warn("Unauthorized send-emote attempt");
            return;
        }

        String userId = principal.getName();
        try {
            gameService.broadcastEmote(userId, request.getGameId(), request.getEmote());
        } catch (Exception ex) {
            log.warn("Failed to broadcast emote: {}", ex.getMessage());
        }
    }
}
