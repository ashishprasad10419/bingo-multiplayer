package com.bingo.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "games")
public class Game {

    @Id
    private String id;

    @Indexed
    private String roomCode;

    @Builder.Default
    private int boardSize = 5;

    @Builder.Default
    private int winningLines = 5;

    @Indexed
    @Builder.Default
    private GameStatus status = GameStatus.PLAYING;

    @Builder.Default
    private List<GamePlayer> players = new ArrayList<>();

    @Builder.Default
    private List<Integer> calledNumbers = new ArrayList<>();

    private String currentTurnUserId;

    @Builder.Default
    private int currentPlayerIndex = 0;

    @Builder.Default
    private int moveNumber = 0;

    private String winnerId;

    private Instant startedAt;

    private Instant finishedAt;

    public GamePlayer findPlayer(String userId) {
        if (players == null) return null;
        return players.stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }
}
