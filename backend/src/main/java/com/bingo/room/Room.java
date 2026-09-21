package com.bingo.room;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
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
@Document(collection = "rooms")
public class Room {

    @Id
    private String id;

    @Indexed(unique = true)
    private String roomCode;

    private String hostId;

    @Builder.Default
    private RoomStatus status = RoomStatus.WAITING;

    @Builder.Default
    private com.bingo.game.GameType gameType = com.bingo.game.GameType.BINGO;

    @Builder.Default
    private int boardSize = 5;

    @Builder.Default
    private int winningLines = 5;

    @Builder.Default
    private int maxPlayers = 6;

    @Builder.Default
    private String bingoMode = "CLASSIC";

    private String passwordHash;

    @Builder.Default
    private List<RoomPlayer> players = new ArrayList<>();

    @Builder.Default
    private boolean allowMatchmaking = false;

    @CreatedDate
    private Instant createdAt;

    public RoomPlayer findPlayerData(String userId) {
        if (players == null) return null;
        return players.stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }
}
