package com.bingo.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "game_history")
public class GameHistory {

    @Id
    private String id;

    private String gameId;

    private String roomCode;

    private List<String> players;

    @Indexed
    private String winnerId;

    private String winnerUsername;

    private int boardSize;

    private int totalMoves;

    private Instant startedAt;

    @Indexed
    private Instant finishedAt;

    private long durationSeconds;
}
