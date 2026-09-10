package com.bingo.badge;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "badges")
public class Badge {

    @Id
    private String id; // e.g. "first_win", "five_streak", "ten_games"

    private String name;

    private String description;

    private String icon;

    private BadgeConditionType conditionType;

    private int requiredValue;
}
