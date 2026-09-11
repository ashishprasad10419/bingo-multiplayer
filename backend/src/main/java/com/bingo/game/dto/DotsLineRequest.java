package com.bingo.game.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DotsLineRequest {
    private String lineType; // "H" or "V"
    private int row;
    private int col;
}
