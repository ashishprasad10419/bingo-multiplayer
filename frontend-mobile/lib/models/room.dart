class RoomPlayer {
  final String userId;
  final String username;
  final String? avatar;
  final bool isHost;
  final bool ready;
  final bool boardLocked;
  final List<List<int>>? board;

  RoomPlayer({
    required this.userId,
    required this.username,
    this.avatar,
    this.isHost = false,
    this.ready = false,
    this.boardLocked = false,
    this.board,
  });

  factory RoomPlayer.fromJson(Map<String, dynamic> json) {
    List<List<int>>? parsedBoard;
    if (json['board'] != null && json['board'] is List) {
      parsedBoard = (json['board'] as List)
          .map((row) => (row as List).map((val) => (val as num).toInt()).toList())
          .toList();
    }

    return RoomPlayer(
      userId: json['userId'] ?? '',
      username: json['username'] ?? 'Player',
      avatar: json['avatar'],
      isHost: json['host'] ?? json['isHost'] ?? false,
      ready: json['ready'] ?? false,
      boardLocked: json['boardLocked'] ?? false,
      board: parsedBoard,
    );
  }
}

class Room {
  final String id;
  final String roomCode;
  final String hostUserId;
  final int maxPlayers;
  final int boardSize;
  final int winningLines;
  final String status;
  final List<RoomPlayer> players;

  Room({
    required this.id,
    required this.roomCode,
    required this.hostUserId,
    this.maxPlayers = 6,
    this.boardSize = 5,
    this.winningLines = 5,
    required this.status,
    required this.players,
  });

  factory Room.fromJson(Map<String, dynamic> json) {
    List<RoomPlayer> parsedPlayers = [];
    if (json['players'] != null && json['players'] is List) {
      parsedPlayers = (json['players'] as List)
          .map((p) => RoomPlayer.fromJson(p as Map<String, dynamic>))
          .toList();
    }

    return Room(
      id: json['id'] ?? '',
      roomCode: json['roomCode'] ?? '',
      hostUserId: json['hostUserId'] ?? '',
      maxPlayers: json['maxPlayers'] ?? 6,
      boardSize: json['boardSize'] ?? 5,
      winningLines: json['winningLines'] ?? 5,
      status: json['status'] ?? 'WAITING',
      players: parsedPlayers,
    );
  }
}
