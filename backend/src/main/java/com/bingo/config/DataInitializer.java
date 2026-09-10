package com.bingo.config;

import com.bingo.badge.Badge;
import com.bingo.badge.BadgeConditionType;
import com.bingo.badge.BadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final BadgeRepository badgeRepository;

    @Override
    public void run(String... args) {
        if (badgeRepository.count() == 0) {
            log.info("Seeding initial badge definitions...");
            List<Badge> defaultBadges = List.of(
                    Badge.builder()
                            .id("first_win")
                            .name("First Victory")
                            .description("Win your first Bingo game.")
                            .icon("trophy")
                            .conditionType(BadgeConditionType.TOTAL_WINS)
                            .requiredValue(1)
                            .build(),
                    Badge.builder()
                            .id("five_streak")
                            .name("On Fire")
                            .description("Win 5 games in a row.")
                            .icon("flame")
                            .conditionType(BadgeConditionType.WIN_STREAK)
                            .requiredValue(5)
                            .build(),
                    Badge.builder()
                            .id("ten_games")
                            .name("Veteran")
                            .description("Play 10 Bingo games.")
                            .icon("award")
                            .conditionType(BadgeConditionType.GAMES_PLAYED)
                            .requiredValue(10)
                            .build()
            );

            badgeRepository.saveAll(defaultBadges);
            log.info("Default badges successfully seeded.");
        }
    }
}
