package com.bingo.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String username;

    @Indexed(unique = true, sparse = true)
    private String email;

    private String passwordHash;

    @Builder.Default
    private String authProvider = "LOCAL";

    @Builder.Default
    private boolean isGuest = false;

    @Builder.Default
    private String avatar = "avatar_1";

    @Builder.Default
    private UserStats stats = new UserStats();

    @Builder.Default
    private int level = 1;

    @Builder.Default
    private int xp = 0;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
