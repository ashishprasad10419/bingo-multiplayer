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
            log.error("Error processing call number: {}", ex.getMessage());
        }
    }
}
