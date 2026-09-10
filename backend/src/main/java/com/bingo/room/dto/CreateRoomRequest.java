package com.bingo.room.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoomRequest {
    private Integer boardSize = 5;
    private Integer winningLines = 5;
    private Integer maxPlayers = 6;
    private String password;
}
