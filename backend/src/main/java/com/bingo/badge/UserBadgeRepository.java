package com.bingo.badge;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends MongoRepository<UserBadge, String> {

    List<UserBadge> findByUserId(String userId);

    Optional<UserBadge> findByUserIdAndBadgeId(String userId, String badgeId);

    boolean existsByUserIdAndBadgeId(String userId, String badgeId);
}
