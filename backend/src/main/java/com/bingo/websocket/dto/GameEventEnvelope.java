package com.bingo.websocket.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GameEventEnvelope {
    private String type;
    private String roomCode;
    private String gameId;

    @Builder.Default
    private long timestamp = System.currentTimeMillis();

    @Builder.Default
    private long gameVersion = 0;

    private Object data;
}
