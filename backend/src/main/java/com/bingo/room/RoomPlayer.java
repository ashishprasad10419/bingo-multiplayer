package com.bingo.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomPlayer {
    private String userId;
    private String username;
    private String avatar;
    private boolean isGuest;

    @Builder.Default
    private boolean ready = false;

    private List<List<Integer>> board;

    @Builder.Default
    private boolean boardLocked = false;
}
