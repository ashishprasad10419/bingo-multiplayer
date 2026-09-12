package com.bingo.websocket;

import com.bingo.websocket.dto.GameEventEnvelope;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameEventService {

    private final SimpMessagingTemplate messagingTemplate;

    public void publishEvent(String roomCode, String gameId, String eventType, Object data) {
        publishEvent(roomCode, gameId, eventType, data, 0);
    }

    public void publishEvent(String roomCode, String gameId, String eventType, Object data, long gameVersion) {
        GameEventEnvelope envelope = GameEventEnvelope.builder()
                .type(eventType)
                .roomCode(roomCode)
                .gameId(gameId)
                .timestamp(System.currentTimeMillis())
                .gameVersion(gameVersion)
                .data(data)
                .build();

        String destination = "/topic/rooms/" + roomCode;
        log.info("Broadcasting {} (v={}) to destination {} payload: {}", eventType, gameVersion, destination, data);
        messagingTemplate.convertAndSend(destination, envelope);
    }
}
