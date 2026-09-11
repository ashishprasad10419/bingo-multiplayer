package com.bingo.game.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DotsWsLine {
    private String gameId;
    private String lineType;
    private int row;
    private int col;
}
