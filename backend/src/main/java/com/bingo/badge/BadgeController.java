package com.bingo.badge;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "Badge definitions and player badges")
public class BadgeController {

    private final BadgeService badgeService;

    @GetMapping("/badges")
    @Operation(summary = "Get all badge definitions")
    public ResponseEntity<List<Badge>> getAllBadges() {
        return ResponseEntity.ok(badgeService.getAllBadges());
    }

    @GetMapping("/users/me/badges")
    @Operation(summary = "Get badges earned by current user")
    public ResponseEntity<List<UserBadge>> getMyBadges(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(badgeService.getUserBadges(userId));
    }
}
