package com.bingo.game.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TttWsMove {
    private String gameId;
    private int row;
    private int col;
    private String clientMoveId;
}
