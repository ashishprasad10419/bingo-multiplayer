package com.bingo.game;

import com.bingo.badge.BadgeService;
import com.bingo.user.User;
import com.bingo.user.UserRepository;
import com.bingo.websocket.GameEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class WinnerService {

    private final GameHistoryRepository gameHistoryRepository;
    private final UserRepository userRepository;
    private final BadgeService badgeService;
    private final GameEventService gameEventService;

    public void handleGameFinished(Game game, GamePlayer winner) {
        Instant now = Instant.now();
        game.setStatus(GameStatus.FINISHED);
        game.setWinnerId(winner.getUserId());
        game.setFinishedAt(now);

        long durationSeconds = (game.getStartedAt() != null)
                ? Duration.between(game.getStartedAt(), now).getSeconds()
                : 0;

        List<String> playerIds = game.getPlayers().stream().map(GamePlayer::getUserId).toList();

        // 1. Write permanent game_history record
        GameHistory history = GameHistory.builder()
                .gameId(game.getId())
                .roomCode(game.getRoomCode())
                .players(playerIds)
                .winnerId(winner.getUserId())
                .winnerUsername(winner.getUsername())
                .boardSize(game.getBoardSize())
                .totalMoves(game.getMoveNumber())
                .startedAt(game.getStartedAt())
                .finishedAt(now)
                .durationSeconds(durationSeconds)
                .build();
        gameHistoryRepository.save(history);

        // 2. Update stats for all players
        for (GamePlayer player : game.getPlayers()) {
            boolean isWinner = player.getUserId().equals(winner.getUserId());
            userRepository.findById(player.getUserId()).ifPresent(user -> {
                user.getStats().setGamesPlayed(user.getStats().getGamesPlayed() + 1);
                if (isWinner) {
                    user.getStats().setGamesWon(user.getStats().getGamesWon() + 1);
                    int newStreak = user.getStats().getCurrentWinStreak() + 1;
                    user.getStats().setCurrentWinStreak(newStreak);
                    if (newStreak > user.getStats().getBestWinStreak()) {
                        user.getStats().setBestWinStreak(newStreak);
                    }
                    user.setXp(user.getXp() + 100);
                } else {
                    user.getStats().setCurrentWinStreak(0);
                    user.setXp(user.getXp() + 25);
                }
                user.setLevel((user.getXp() / 200) + 1);
                userRepository.save(user);

                // 3. Award eligible badges
                badgeService.checkAndAwardBadges(user.getId());
            });
        }

        // 4. Broadcast GAME_FINISHED event
        gameEventService.publishEvent(game.getRoomCode(), game.getId(), "GAME_FINISHED", Map.of(
                "winner", Map.of(
                        "userId", winner.getUserId(),
                        "username", winner.getUsername(),
                        "avatar", winner.getAvatar() != null ? winner.getAvatar() : ""
                ),
                "lines", winner.getLineCount(),
                "totalMoves", game.getMoveNumber()
        ));
    }
}
