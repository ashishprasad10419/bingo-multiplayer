import 'dart:async';
import 'package:flutter/material.dart';
import '../core/api/api_client.dart';
import '../core/socket/stomp_socket_service.dart';
import '../models/room.dart';
import '../models/game.dart';

class ActiveMobileEmote {
  final String id;
  final String userId;
  final String username;
  final String emote;
  final DateTime timestamp;

  ActiveMobileEmote({
    required this.id,
    required this.userId,
    required this.username,
    required this.emote,
    required this.timestamp,
  });
}

class GameProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  final StompSocketService _socket = StompSocketService();

  Room? _room;
  Game? _game;
  List<List<int>>? _board;
  int _lineCount = 0;
  int? _pendingPick;
  bool _calling = false;
  Map<int, String> _calledByMap = {};
  final List<ActiveMobileEmote> _activeEmotes = [];
  String? _winnerUsername;
  bool _hasWon = false;
  bool _isLoading = false;
  String? _error;
  Timer? _heartbeatTimer;

  Room? get room => _room;
  Game? get game => _game;
  List<List<int>>? get board => _board;
  int get lineCount => _lineCount;
  int? get pendingPick => _pendingPick;
  bool get calling => _calling;
  Map<int, String> get calledByMap => _calledByMap;
  List<ActiveMobileEmote> get activeEmotes => _activeEmotes;
  String? get winnerUsername => _winnerUsername;
  bool get hasWon => _hasWon;
  bool get isLoading => _isLoading;
  String? get error => _error;

  void setBoard(List<List<int>> newBoard) {
    _board = newBoard;
    notifyListeners();
  }

  Future<Room> fetchRoom(String roomCode) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      _room = await _api.getRoom(roomCode);
      _isLoading = false;
      notifyListeners();
      return _room!;
    } catch (e: any) {
      _isLoading = false;
      _error = e.response?.data?['message'] ?? 'Failed to load room';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> initSocket(String roomCode, String currentUserId) async {
    await _socket.connect(roomCode, (event) {
      _handleSocketEvent(event, currentUserId);
    });

    // Authoritative 1.5s heartbeat
    _heartbeatTimer?.cancel();
    _heartbeatTimer = Timer.periodic(const Duration(milliseconds: 1500), (_) async {
      if (_game != null && _game!.status == 'PLAYING') {
        try {
          final authoritative = await _api.getGameByRoom(roomCode);
          _game = authoritative;
          final me = authoritative.players.where((p) => p.userId == currentUserId).firstOrNull;
          if (me != null) {
            _board = me.board;
            _lineCount = me.lineCount;
          }
          if (_pendingPick != null && authoritative.calledNumbers.contains(_pendingPick)) {
            _pendingPick = null;
            _calling = false;
          }
          notifyListeners();
        } catch (_) {}
      }
    });
  }

  void _handleSocketEvent(Map<String, dynamic> event, String currentUserId) {
    final type = event['type'] as String?;
    final data = event['data'] as Map<String, dynamic>?;
    if (data == null) return;

    switch (type) {
      case 'ROOM_UPDATED':
        _room = Room.fromJson(data);
        notifyListeners();
        break;

      case 'GAME_STARTED':
        final gameId = data['gameId'] as String?;
        if (gameId != null) {
          _api.getGame(gameId).then((g) {
            _game = g;
            final me = g.players.where((p) => p.userId == currentUserId).firstOrNull;
            if (me != null) {
              _board = me.board;
              _lineCount = me.lineCount;
            }
            notifyListeners();
          });
        }
        break;

      case 'NUMBER_CALLED':
        if (_game != null) {
          final number = data['number'] as int?;
          final nextTurn = data['nextTurn'] as String?;
          final calledBy = data['calledBy'] as Map<String, dynamic>?;
          final callerUserId = calledBy?['userId'] as String?;

          if (number != null && callerUserId != null) {
            _calledByMap[number] = callerUserId;
          }

          List<int> updatedCalled = List.from(_game!.calledNumbers);
          if (number != null && !updatedCalled.contains(number)) {
            updatedCalled.add(number);
          }

          if (_pendingPick == number) {
            _pendingPick = null;
            _calling = false;
          }

          _game = Game(
            id: _game!.id,
            roomCode: _game!.roomCode,
            boardSize: _game!.boardSize,
            winningLines: _game!.winningLines,
            status: _game!.status,
            players: _game!.players,
            calledNumbers: updatedCalled,
            moves: _game!.moves,
            currentTurnUserId: nextTurn ?? _game!.currentTurnUserId,
            moveNumber: _game!.moveNumber + 1,
            winnerId: _game!.winnerId,
          );
          notifyListeners();
        }
        break;

      case 'TURN_CHANGED':
        if (_game != null) {
          final nextUser = data['currentTurnUserId'] as String?;
          if (nextUser != null) {
            _game = Game(
              id: _game!.id,
              roomCode: _game!.roomCode,
              boardSize: _game!.boardSize,
              winningLines: _game!.winningLines,
              status: _game!.status,
              players: _game!.players,
              calledNumbers: _game!.calledNumbers,
              moves: _game!.moves,
              currentTurnUserId: nextUser,
              moveNumber: _game!.moveNumber,
              winnerId: _game!.winnerId,
            );
            if (nextUser != currentUserId) {
              _pendingPick = null;
              _calling = false;
            }
            notifyListeners();
          }
        }
        break;

      case 'LINE_COMPLETED':
        final userId = data['userId'] as String?;
        final lines = data['lineCount'] as int?;
        if (userId == currentUserId && lines != null) {
          _lineCount = lines;
          notifyListeners();
        }
        break;

      case 'GAME_FINISHED':
        final winner = data['winner'] as Map<String, dynamic>?;
        _winnerUsername = winner?['username'] ?? 'Player';
        _hasWon = winner?['userId'] == currentUserId;
        if (_game != null) {
          _game = Game(
            id: _game!.id,
            roomCode: _game!.roomCode,
            boardSize: _game!.boardSize,
            winningLines: _game!.winningLines,
            status: 'FINISHED',
            players: _game!.players,
            calledNumbers: _game!.calledNumbers,
            moves: _game!.moves,
            currentTurnUserId: _game!.currentTurnUserId,
            moveNumber: _game!.moveNumber,
            winnerId: winner?['userId'],
          );
        }
        notifyListeners();
        break;

      case 'EMOTE_SENT':
        final emote = data['emote'] as String?;
        final senderId = data['userId'] as String?;
        final username = data['username'] as String? ?? 'Player';
        if (emote != null && senderId != null) {
          final newEmote = ActiveMobileEmote(
            id: '$senderId-${DateTime.now().millisecondsSinceEpoch}',
            userId: senderId,
            username: username,
            emote: emote,
            timestamp: DateTime.now(),
          );
          _activeEmotes.add(newEmote);
          if (_activeEmotes.length > 10) {
            _activeEmotes.removeAt(0);
          }
          notifyListeners();

          // Auto-remove after 3 seconds
          Timer(const Duration(seconds: 3), () {
            _activeEmotes.remove(newEmote);
            notifyListeners();
          });
        }
        break;
    }
  }

  Future<void> callNumber(int value, String currentUserId) async {
    if (_game == null || _calling || _pendingPick != null) return;
    if (_game!.currentTurnUserId != currentUserId) return;
    if (_game!.calledNumbers.contains(value)) return;

    // 1. INSTANT 0ms OPTIMISTIC UI FEEDBACK
    _pendingPick = value;
    _calling = true;
    _error = null;
    notifyListeners();

    // 2. STOMP WebSocket Dispatch
    final socketSent = _socket.callNumber(_game!.id, value);

    // 3. Fast Dual-Channel Guarantee
    if (!socketSent) {
      try {
        _game = await _api.callNumber(_game!.id, value);
      } catch (e: any) {
        if (!e.toString().contains('already')) {
          _error = 'Failed to call number';
          _pendingPick = null;
        }
      } finally {
        _calling = false;
        notifyListeners();
      }
    } else {
      // 350ms safety fallback timer
      Timer(const Duration(milliseconds: 350), () async {
        if (_game != null &&
            !_game!.calledNumbers.contains(value) &&
            _game!.currentTurnUserId == currentUserId) {
          try {
            await _api.callNumber(_game!.id, value);
          } catch (_) {}
        }
      });
      Timer(const Duration(milliseconds: 300), () {
        _calling = false;
        notifyListeners();
      });
    }
  }

  void sendEmote(String emote, String currentUserId, String username) {
    if (_game == null) return;

    // Optimistic local add
    final localEmote = ActiveMobileEmote(
      id: '$currentUserId-${DateTime.now().millisecondsSinceEpoch}',
      userId: currentUserId,
      username: username,
      emote: emote,
      timestamp: DateTime.now(),
    );
    _activeEmotes.add(localEmote);
    notifyListeners();

    Timer(const Duration(seconds: 3), () {
      _activeEmotes.remove(localEmote);
      notifyListeners();
    });

    final sent = _socket.sendEmote(_game!.id, _game!.roomCode, emote);
    if (!sent) {
      _api.sendEmote(_game!.id, emote).catchError((_) {});
    }
  }

  void reset() {
    _heartbeatTimer?.cancel();
    _socket.disconnect();
    _room = null;
    _game = null;
    _board = null;
    _lineCount = 0;
    _pendingPick = null;
    _calling = false;
    _calledByMap.clear();
    _activeEmotes.clear();
    _winnerUsername = null;
    _hasWon = false;
    _error = null;
    notifyListeners();
  }

  @override
  void dispose() {
    _heartbeatTimer?.cancel();
    _socket.disconnect();
    super.dispose();
  }
}
