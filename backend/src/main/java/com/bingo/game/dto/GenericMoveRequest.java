package com.bingo.game.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GenericMoveRequest {
    private String gameId;
    private String clientMoveId;

    // Connect Four
    private Integer col;

    // Rock Paper Scissors
    private String choice;

    // Memory
    private Integer cardIndex;

    // Number Rush
    private Integer tappedNumber;

    // Word Scramble
    private String guess;

    // Quiz Battle
    private Integer answerIndex;
}
