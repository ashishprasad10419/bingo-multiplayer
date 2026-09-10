package com.bingo.badge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "user_badges")
@CompoundIndex(name = "user_badge_unique_idx", def = "{'userId': 1, 'badgeId': 1}", unique = true)
public class UserBadge {

    @Id
    private String id;

    private String userId;

    private String badgeId;

    @CreatedDate
    private Instant earnedAt;
}
