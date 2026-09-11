import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:stomp_dart_client/stomp_dart_client.dart';
import '../constants/api_constants.dart';

typedef GameEventListener = void Function(Map<String, dynamic> event);

class StompSocketService {
  static final StompSocketService _instance = StompSocketService._internal();
  factory StompSocketService() => _instance;

  StompClient? _client;
  String? _currentRoomCode;
  final List<GameEventListener> _listeners = [];
  bool _isConnected = false;

  StompSocketService._internal();

  bool get isConnected => _isConnected;

  Future<void> connect(String roomCode, GameEventListener onEvent) async {
    _currentRoomCode = roomCode;
    if (!_listeners.contains(onEvent)) {
      _listeners.add(onEvent);
    }

    if (_client != null && _isConnected) {
      _subscribe(roomCode);
      return;
    }

    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('bingo_token') ?? '';

    _client = StompClient(
      config: StompConfig(
        url: ApiConstants.wsUrl,
        onConnect: (frame) {
          _isConnected = true;
          if (_currentRoomCode != null) {
            _subscribe(_currentRoomCode!);
          }
        },
        onDisconnect: (frame) {
          _isConnected = false;
        },
        onWebSocketError: (error) {
          _isConnected = false;
        },
        stompConnectHeaders: {
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
        webSocketConnectHeaders: {
          if (token.isNotEmpty) 'Authorization': 'Bearer $token',
        },
      ),
    );

    _client?.activate();
  }

  void _subscribe(String roomCode) {
    _client?.subscribe(
      destination: '/topic/rooms/${roomCode.toUpperCase()}',
      callback: (frame) {
        if (frame.body != null) {
          try {
            final data = jsonDecode(frame.body!) as Map<String, dynamic>;
            for (var listener in _listeners) {
              listener(data);
            }
          } catch (_) {}
        }
      },
    );
  }

  bool callNumber(String gameId, int number) {
    if (_client == null || !_isConnected) return false;
    try {
      _client?.send(
        destination: '/app/game/call-number',
        body: jsonEncode({'gameId': gameId, 'number': number}),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  bool sendEmote(String gameId, String roomCode, String emote) {
    if (_client == null || !_isConnected) return false;
    try {
      _client?.send(
        destination: '/app/game/send-emote',
        body: jsonEncode({
          'gameId': gameId,
          'roomCode': roomCode,
          'emote': emote,
        }),
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  void removeListener(GameEventListener listener) {
    _listeners.remove(listener);
  }

  void disconnect() {
    _client?.deactivate();
    _client = null;
    _isConnected = false;
    _listeners.clear();
    _currentRoomCode = null;
  }
}
