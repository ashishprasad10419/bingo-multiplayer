package com.bingo.game.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CallNumberRequest {
    @NotBlank(message = "gameId is required")
    private String gameId;

    @Min(value = 1, message = "Number must be at least 1")
    @Max(value = 25, message = "Number must be at most 25")
    private int number;
}
