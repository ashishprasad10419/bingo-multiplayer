package com.bingo.game;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "games")
public class Game {

    @Id
    private String id;

    @Indexed
    private String roomCode;

    @Builder.Default
    private GameType gameType = GameType.BINGO;

    @Builder.Default
    private int boardSize = 5;

    @Builder.Default
    private int winningLines = 5;

    @Builder.Default
    private String bingoMode = "CLASSIC";

    // --- Tic-Tac-Toe Specific State ---
    @Builder.Default
    private int tttGridSize = 3;

    @Builder.Default
    private List<String> tttBoard = new ArrayList<>(); // values: userId, or ""

    // --- Dots & Boxes Specific State ---
    @Builder.Default
    private int dotsGridSize = 4; // dot count per side (4x4 dots = 3x3 boxes)

    @Builder.Default
    private List<String> horizontalLines = new ArrayList<>(); // "r-c"

    @Builder.Default
    private List<String> verticalLines = new ArrayList<>(); // "r-c"

    @Builder.Default
    private java.util.Map<String, String> completedBoxes = new java.util.HashMap<>(); // "boxR-boxC" -> winner userId

    @Builder.Default
    private java.util.Map<String, Integer> playerScores = new java.util.HashMap<>(); // userId -> score

    @Builder.Default
    private java.util.Map<String, String> lineOwners = new java.util.HashMap<>(); // "H-r-c" or "V-r-c" -> userId

    // --- Connect Four State ---
    @Builder.Default
    private int c4Cols = 7;
    @Builder.Default
    private int c4Rows = 6;
    @Builder.Default
    private List<String> c4Board = new ArrayList<>(); // 42 cells, values: userId or ""
    @Builder.Default
    private List<Integer> c4WinningCells = new ArrayList<>();

    // --- Rock Paper Scissors State ---
    @Builder.Default
    private int rpsRound = 1;
    @Builder.Default
    private int rpsTargetWins = 3;
    @Builder.Default
    private java.util.Map<String, String> rpsChoices = new java.util.HashMap<>(); // userId -> "ROCK"/"PAPER"/"SCISSORS"
    @Builder.Default
    private java.util.Map<String, Integer> rpsRoundWins = new java.util.HashMap<>(); // userId -> wins
    @Builder.Default
    private java.util.Map<String, Object> rpsLastRoundResult = new java.util.HashMap<>();

    // --- Memory Match State ---
    @Builder.Default
    private List<String> memoryCards = new ArrayList<>(); // 16 card symbols
    @Builder.Default
    private List<Boolean> memoryMatched = new ArrayList<>(); // 16 booleans
    @Builder.Default
    private List<Integer> memoryFlippedIndices = new ArrayList<>(); // 0, 1, or 2 indices

    // --- Number Rush State ---
    @Builder.Default
    private java.util.Map<String, List<Integer>> numberRushBoards = new java.util.HashMap<>(); // userId -> shuffled 1..25
    @Builder.Default
    private java.util.Map<String, Integer> numberRushProgress = new java.util.HashMap<>(); // userId -> next expected number

    // --- Word Scramble State ---
    @Builder.Default
    private List<String> scrambleWords = new ArrayList<>();
    @Builder.Default
    private List<String> scrambleHints = new ArrayList<>();
    @Builder.Default
    private List<String> scrambleJumbled = new ArrayList<>();
    @Builder.Default
    private int scrambleCurrentRound = 0;
    @Builder.Default
    private String scrambleLastWinnerId = null;
    @Builder.Default
    private java.util.Map<String, Object> scrambleLastSolveResult = new java.util.HashMap<>();
    @Builder.Default
    private List<java.util.Map<String, Object>> scrambleRoundHistory = new ArrayList<>();

    // --- Quiz Battle State ---
    @Builder.Default
    private List<String> quizQuestions = new ArrayList<>();
    @Builder.Default
    private List<List<String>> quizOptions = new ArrayList<>();
    @Builder.Default
    private List<Integer> quizCorrectIndices = new ArrayList<>();
    @Builder.Default
    private int quizCurrentQuestion = 0;
    @Builder.Default
    private java.util.Map<String, Integer> quizAnswers = new java.util.HashMap<>(); // userId -> selected option index

    // --- Ship Battle State ---
    @Builder.Default
    private String shipPhase = "SETUP"; // "SETUP" or "BATTLE"
    @Builder.Default
    private java.util.Map<String, List<com.bingo.game.engine.ShipBattleEngine.ShipPlacement>> shipFleets = new java.util.HashMap<>();
    @Builder.Default
    private java.util.Map<String, Boolean> shipFleetsLocked = new java.util.HashMap<>();
    @Builder.Default
    private java.util.Map<String, List<com.bingo.game.engine.ShipBattleEngine.ShipAttack>> shipAttacks = new java.util.HashMap<>();
    @Builder.Default
    private java.util.Map<String, List<String>> shipSunkTypes = new java.util.HashMap<>();
    @Builder.Default
    private java.util.Map<String, Object> shipLastAttackResult = new java.util.HashMap<>();

    // --- Mastermind State ---
    @Builder.Default
    private String mastermindPhase = "SETUP"; // "SETUP" or "BATTLE"
    @Builder.Default
    private java.util.Map<String, List<String>> mastermindSecrets = new java.util.HashMap<>(); // userId -> 4-color secret code
    @Builder.Default
    private java.util.Map<String, Boolean> mastermindSecretsLocked = new java.util.HashMap<>(); // userId -> locked
    @Builder.Default
    private java.util.Map<String, List<com.bingo.game.engine.MastermindEngine.MastermindGuessRecord>> mastermindGuesses = new java.util.HashMap<>(); // userId -> history
    @Builder.Default
    private int mastermindMaxAttempts = 8;
    @Builder.Default
    private java.util.Map<String, Object> mastermindLastGuessResult = new java.util.HashMap<>();

    @Indexed
    @Builder.Default
    private GameStatus status = GameStatus.PLAYING;

    @Builder.Default
    private List<GamePlayer> players = new ArrayList<>();

    @Builder.Default
    private List<Integer> calledNumbers = new ArrayList<>();

    @Builder.Default
    private List<com.bingo.game.dto.CalledNumberRecord> moves = new ArrayList<>();

    private String currentTurnUserId;

    @Builder.Default
    private int currentPlayerIndex = 0;

    @Builder.Default
    private int moveNumber = 0;

    @Builder.Default
    private long version = 0;

    @Builder.Default
    private java.util.Set<String> processedMoveIds = new java.util.HashSet<>();

    private String winnerId;

    private Instant startedAt;

    private Instant finishedAt;

    public GamePlayer findPlayer(String userId) {
        if (players == null) return null;
        return players.stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElse(null);
    }
}
