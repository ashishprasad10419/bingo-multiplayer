package com.bingo.leaderboard;

import com.bingo.user.User;
import com.bingo.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;

    public List<User> getTopPlayers(int limit) {
        int cappedLimit = Math.min(Math.max(limit, 1), 100);
        return userRepository.findTopByGamesWon(PageRequest.of(0, cappedLimit))
                .stream()
                .map(u -> {
                    User clean = new User();
                    clean.setId(u.getId());
                    clean.setUsername(u.getUsername());
                    clean.setAvatar(u.getAvatar());
                    clean.setStats(u.getStats());
                    clean.setLevel(u.getLevel());
                    clean.setXp(u.getXp());
                    return clean;
                })
                .toList();
    }
}
