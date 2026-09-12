package com.bingo.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    private com.bingo.game.GameType gameType = com.bingo.game.GameType.BINGO;
    private Integer boardSize = 5;
    private Integer winningLines = 5;
    private Integer maxPlayers = 6;
    private Integer gridSize = 3; // for TicTacToe (3..5) or DotsAndBoxes (dots: 3..5)
    private String bingoMode = "CLASSIC";
    private String password;
}
