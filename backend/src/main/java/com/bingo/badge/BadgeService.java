package com.bingo.badge;

import com.bingo.user.User;
import com.bingo.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    public List<Badge> getAllBadges() {
        return badgeRepository.findAll();
    }

    public List<UserBadge> getUserBadges(String userId) {
        return userBadgeRepository.findByUserId(userId);
    }

    public List<Badge> checkAndAwardBadges(String userId) {
        List<Badge> newlyAwarded = new ArrayList<>();
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.isGuest()) {
            return newlyAwarded;
        }

        List<Badge> allBadges = badgeRepository.findAll();
        for (Badge badge : allBadges) {
            if (userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId())) {
                continue;
            }

            boolean qualified = false;
            switch (badge.getConditionType()) {
                case TOTAL_WINS -> qualified = user.getStats().getGamesWon() >= badge.getRequiredValue();
                case WIN_STREAK -> qualified = user.getStats().getCurrentWinStreak() >= badge.getRequiredValue();
                case GAMES_PLAYED -> qualified = user.getStats().getGamesPlayed() >= badge.getRequiredValue();
            }

            if (qualified) {
                UserBadge userBadge = UserBadge.builder()
                        .userId(userId)
                        .badgeId(badge.getId())
                        .earnedAt(Instant.now())
                        .build();
                try {
                    userBadgeRepository.save(userBadge);
                    newlyAwarded.add(badge);
                    log.info("Awarded badge {} to user {}", badge.getName(), user.getUsername());
                } catch (Exception e) {
                    log.warn("Badge {} already awarded to user {}: {}", badge.getId(), userId, e.getMessage());
                }
            }
        }

        return newlyAwarded;
    }
}
