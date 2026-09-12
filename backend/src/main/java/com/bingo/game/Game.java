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
    private GameType gameType = GameType.BINGO;

    @Builder.Default
    private int boardSize = 5;

    @Builder.Default
    private int winningLines = 5;

    @Builder.Default
    private String bingoMode = "CLASSIC";

    // --- Tic-Tac-Toe Specific State ---
    @Builder.Default
    private int tttGridSize = 3;

    @Builder.Default
    private List<String> tttBoard = new ArrayList<>(); // values: userId, or ""

    // --- Dots & Boxes Specific State ---
    @Builder.Default
    private int dotsGridSize = 4; // dot count per side (4x4 dots = 3x3 boxes)

    @Builder.Default
    private List<String> horizontalLines = new ArrayList<>(); // "r-c"

    @Builder.Default
    private List<String> verticalLines = new ArrayList<>(); // "r-c"

    @Builder.Default
    private java.util.Map<String, String> completedBoxes = new java.util.HashMap<>(); // "boxR-boxC" -> winner userId

    @Builder.Default
    private java.util.Map<String, Integer> playerScores = new java.util.HashMap<>(); // userId -> score

    @Indexed
    @Builder.Default
    private GameStatus status = GameStatus.PLAYING;

    @Builder.Default
    private List<GamePlayer> players = new ArrayList<>();

    @Builder.Default
    private List<Integer> calledNumbers = new ArrayList<>();

    @Builder.Default
    private List<com.bingo.game.dto.CalledNumberRecord> moves = new ArrayList<>();

    private String currentTurnUserId;

    @Builder.Default
    private int currentPlayerIndex = 0;

    @Builder.Default
    private int moveNumber = 0;

    @Builder.Default
    private long version = 0;

    @Builder.Default
    private java.util.Set<String> processedMoveIds = new java.util.HashSet<>();

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
