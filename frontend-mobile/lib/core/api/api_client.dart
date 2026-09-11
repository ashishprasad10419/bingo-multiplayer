import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/api_constants.dart';
import '../../models/user.dart';
import '../../models/room.dart';
import '../../models/game.dart';

class ApiClient {
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;

  late final Dio dio;

  ApiClient._internal() {
    dio = Dio(
      BaseOptions(
        baseUrl: ApiConstants.baseUrl,
        connectTimeout: const Duration(seconds: 30),
        receiveTimeout: const Duration(seconds: 30),
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Type': 'mobile',
        },
      ),
    );

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          final prefs = await SharedPreferences.getInstance();
          final token = prefs.getString('bingo_token');
          if (token != null && token.isNotEmpty) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) {
          return handler.next(e);
        },
      ),
    );
  }

  // --- Auth API ---
  Future<Map<String, dynamic>> login(String username, String password) async {
    final response = await dio.post(ApiConstants.login, data: {
      'username': username,
      'password': password,
    });
    final token = response.data['token'];
    if (token != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('bingo_token', token);
    }
    return response.data;
  }

  Future<Map<String, dynamic>> register(String username, String email, String password, [String? avatar]) async {
    final response = await dio.post(ApiConstants.register, data: {
      'username': username,
      'email': email,
      'password': password,
      'avatar': avatar,
    });
    final token = response.data['token'];
    if (token != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('bingo_token', token);
    }
    return response.data;
  }

  Future<Map<String, dynamic>> guestLogin(String username) async {
    final response = await dio.post(ApiConstants.guestLogin, data: {
      'username': username,
    });
    final token = response.data['token'];
    if (token != null) {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('bingo_token', token);
    }
    return response.data;
  }

  Future<User> getMe() async {
    final response = await dio.get(ApiConstants.me);
    return User.fromJson(response.data);
  }

  // --- Room API ---
  Future<Room> createRoom({int maxPlayers = 6, int boardSize = 5, int winningLines = 5}) async {
    final response = await dio.post(ApiConstants.createRoom, data: {
      'maxPlayers': maxPlayers,
      'boardSize': boardSize,
      'winningLines': winningLines,
    });
    return Room.fromJson(response.data);
  }

  Future<Room> getRoom(String roomCode) async {
    final response = await dio.get(ApiConstants.getRoom(roomCode));
    return Room.fromJson(response.data);
  }

  Future<Room> joinRoom(String roomCode) async {
    final response = await dio.post(ApiConstants.joinRoom(roomCode));
    return Room.fromJson(response.data);
  }

  Future<void> leaveRoom(String roomCode) async {
    await dio.post(ApiConstants.leaveRoom(roomCode));
  }

  Future<Room> lockBoard(String roomCode, [List<List<int>>? board]) async {
    final response = await dio.post(ApiConstants.lockBoard(roomCode), data: {
      'board': board,
    });
    return Room.fromJson(response.data);
  }

  Future<List<List<int>>> swapCells(String roomCode, Map<String, int> from, Map<String, int> to) async {
    final response = await dio.post(ApiConstants.swapCells(roomCode), data: {
      'from': from,
      'to': to,
    });
    return (response.data as List)
        .map((row) => (row as List).map((v) => (v as num).toInt()).toList())
        .toList();
  }

  Future<Game> startGame(String roomCode) async {
    final response = await dio.post(ApiConstants.startGame(roomCode));
    return Game.fromJson(response.data);
  }

  // --- Game API ---
  Future<Game> getGame(String gameId) async {
    final response = await dio.get(ApiConstants.getGame(gameId));
    return Game.fromJson(response.data);
  }

  Future<Game> getGameByRoom(String roomCode) async {
    final response = await dio.get(ApiConstants.getGameByRoom(roomCode));
    return Game.fromJson(response.data);
  }

  Future<Game> callNumber(String gameId, int number) async {
    final response = await dio.post(ApiConstants.callNumber(gameId, number));
    return Game.fromJson(response.data);
  }

  Future<void> sendEmote(String gameId, String emote) async {
    await dio.post(ApiConstants.sendEmote(gameId, emote));
  }
}
