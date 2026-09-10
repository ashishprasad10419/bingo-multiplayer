package com.bingo.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStats {
    @Builder.Default
    private int gamesPlayed = 0;

    @Builder.Default
    private int gamesWon = 0;

    @Builder.Default
    private int currentWinStreak = 0;

    @Builder.Default
    private int bestWinStreak = 0;
}
