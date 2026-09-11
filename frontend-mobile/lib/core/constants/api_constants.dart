class ApiConstants {
  // Production Render Cloud Backend
  static const String baseUrl = 'https://bingo-multiplayer-kqtx.onrender.com/api';
  static const String wsUrl = 'wss://bingo-multiplayer-kqtx.onrender.com/ws';

  // Auth Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String guestLogin = '/auth/guest';
  static const String me = '/auth/me';

  // Room Endpoints
  static const String createRoom = '/rooms';
  static String getRoom(String code) => '/rooms/$code';
  static String joinRoom(String code) => '/rooms/$code/join';
  static String leaveRoom(String code) => '/rooms/$code/leave';
  static String lockBoard(String code) => '/rooms/$code/lock';
  static String swapCells(String code) => '/rooms/$code/swap';
  static String startGame(String code) => '/rooms/$code/start';

  // Game Endpoints
  static String getGame(String id) => '/games/$id';
  static String getGameByRoom(String code) => '/games/room/$code';
  static String callNumber(String id, int number) => '/games/$id/call?number=$number';
  static String sendEmote(String id, String emote) => '/games/$id/emote?emote=${Uri.encodeComponent(emote)}';

  // Leaderboard & Badges
  static const String leaderboard = '/leaderboard';
  static const String badges = '/badges';
}
