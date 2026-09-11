class GamePlayer {
  final String userId;
  final String username;
  final String? avatar;
  final bool isGuest;
  final List<List<int>> board;
  final bool locked;
  final int lineCount;
  final String connectionStatus;

  GamePlayer({
    required this.userId,
    required this.username,
    this.avatar,
    this.isGuest = false,
    required this.board,
    this.locked = true,
    this.lineCount = 0,
    this.connectionStatus = 'CONNECTED',
  });

  factory GamePlayer.fromJson(Map<String, dynamic> json) {
    List<List<int>> parsedBoard = [];
    if (json['board'] != null && json['board'] is List) {
      parsedBoard = (json['board'] as List)
          .map((row) => (row as List).map((val) => (val as num).toInt()).toList())
          .toList();
    }

    return GamePlayer(
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Player',
      avatar: json['avatar'],
      isGuest: json['isGuest'] ?? false,
      board: parsedBoard,
      locked: json['locked'] ?? true,
      lineCount: json['lineCount'] ?? 0,
      connectionStatus: json['connectionStatus'] ?? 'CONNECTED',
    );
  }
}

class MoveRecord {
  final int number;
  final String calledByUserId;
  final String? calledByUsername;

  MoveRecord({
    required this.number,
    required this.calledByUserId,
    this.calledByUsername,
  });

  factory MoveRecord.fromJson(Map<String, dynamic> json) {
    return MoveRecord(
      number: json['number'] ?? 0,
      calledByUserId: json['calledByUserId'] ?? '',
      calledByUsername: json['calledByUsername'],
    );
  }
}

class Game {
  final String id;
  final String roomCode;
  final int boardSize;
  final int winningLines;
  final String status;
  final List<GamePlayer> players;
  final List<int> calledNumbers;
  final List<MoveRecord> moves;
  final String currentTurnUserId;
  final int moveNumber;
  final String? winnerId;

  Game({
    required this.id,
    required this.roomCode,
    this.boardSize = 5,
    this.winningLines = 5,
    required this.status,
    required this.players,
    required this.calledNumbers,
    required this.moves,
    required this.currentTurnUserId,
    this.moveNumber = 0,
    this.winnerId,
  });

  factory Game.fromJson(Map<String, dynamic> json) {
    List<GamePlayer> parsedPlayers = [];
    if (json['players'] != null && json['players'] is List) {
      parsedPlayers = (json['players'] as List)
          .map((p) => GamePlayer.fromJson(p as Map<String, dynamic>))
          .toList();
    }

    List<int> parsedCalled = [];
    if (json['calledNumbers'] != null && json['calledNumbers'] is List) {
      parsedCalled = (json['calledNumbers'] as List)
          .map((n) => (n as num).toInt())
          .toList();
    }

    List<MoveRecord> parsedMoves = [];
    if (json['moves'] != null && json['moves'] is List) {
      parsedMoves = (json['moves'] as List)
          .map((m) => MoveRecord.fromJson(m as Map<String, dynamic>))
          .toList();
    }

    return Game(
      id: json['id'] ?? '',
      roomCode: json['roomCode'] ?? '',
      boardSize: json['boardSize'] ?? 5,
      winningLines: json['winningLines'] ?? 5,
      status: json['status'] ?? 'PLAYING',
      players: parsedPlayers,
      calledNumbers: parsedCalled,
      moves: parsedMoves,
      currentTurnUserId: json['currentTurnUserId'] ?? '',
      moveNumber: json['moveNumber'] ?? 0,
      winnerId: json['winnerId'],
    );
  }
}
