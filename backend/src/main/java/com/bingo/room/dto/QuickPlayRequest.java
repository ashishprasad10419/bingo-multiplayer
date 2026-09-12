package com.bingo.room.dto;

import com.bingo.game.GameType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuickPlayRequest {
    private GameType gameType = GameType.BINGO;
    private String bingoMode = "CLASSIC";
}
