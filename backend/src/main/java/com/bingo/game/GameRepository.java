package com.bingo.game;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GameRepository extends MongoRepository<Game, String> {

    Optional<Game> findByRoomCodeAndStatus(String roomCode, GameStatus status);

    Optional<Game> findFirstByRoomCodeOrderByStartedAtDesc(String roomCode);

    List<Game> findByStatus(GameStatus status);
}
