package com.bingo.game.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendEmoteRequest {
    @NotBlank(message = "Game ID is required")
    private String gameId;

    @NotBlank(message = "Room code is required")
    private String roomCode;

    @NotBlank(message = "Emote is required")
    private String emote;
}
