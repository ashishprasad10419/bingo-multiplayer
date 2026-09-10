package com.bingo.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GamePlayer {
    private String userId;
    private String username;
    private String avatar;
    private boolean isGuest;
    private List<List<Integer>> board;

    @Builder.Default
    private boolean locked = true;

    @Builder.Default
    private int lineCount = 0;

    @Builder.Default
    private ConnectionStatus connectionStatus = ConnectionStatus.CONNECTED;
}
