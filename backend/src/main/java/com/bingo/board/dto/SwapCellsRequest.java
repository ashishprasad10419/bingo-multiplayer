package com.bingo.board.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SwapCellsRequest {
    @NotNull
    @Valid
    private CellPosition position1;

    @NotNull
    @Valid
    private CellPosition position2;
}
