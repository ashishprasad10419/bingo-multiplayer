package com.bingo.board.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CellPosition {
    @Min(0)
    @Max(9)
    private int row;

    @Min(0)
    @Max(9)
    private int column;
}
