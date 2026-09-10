package com.bingo.game;

import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameHistoryRepository extends MongoRepository<GameHistory, String> {

    List<GameHistory> findByWinnerIdOrderByFinishedAtDesc(String winnerId, Pageable pageable);

    List<GameHistory> findByPlayersContainingOrderByFinishedAtDesc(String userId, Pageable pageable);
}
