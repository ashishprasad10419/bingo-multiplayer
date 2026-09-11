class UserStats {
  final int totalGames;
  final int totalWins;
  final int currentWinStreak;
  final int bestWinStreak;
  final double winRate;

  UserStats({
    this.totalGames = 0,
    this.totalWins = 0,
    this.currentWinStreak = 0,
    this.bestWinStreak = 0,
    this.winRate = 0.0,
  });

  factory UserStats.fromJson(Map<String, dynamic>? json) {
    if (json == null) return UserStats();
    return UserStats(
      totalGames: json['totalGames'] ?? 0,
      totalWins: json['totalWins'] ?? 0,
      currentWinStreak: json['currentWinStreak'] ?? 0,
      bestWinStreak: json['bestWinStreak'] ?? 0,
      winRate: (json['winRate'] as num?)?.toDouble() ?? 0.0,
    );
  }

  Map<String, dynamic> toJson() => {
    'totalGames': totalGames,
    'totalWins': totalWins,
    'currentWinStreak': currentWinStreak,
    'bestWinStreak': bestWinStreak,
    'winRate': winRate,
  };
}

class User {
  final String id;
  final String username;
  final String? email;
  final String? avatar;
  final bool isGuest;
  final int level;
  final int xp;
  final UserStats stats;

  User({
    required this.id,
    required this.username,
    this.email,
    this.avatar,
    this.isGuest = false,
    this.level = 1,
    this.xp = 0,
    UserStats? stats,
  }) : stats = stats ?? UserStats();

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] ?? '',
      username: json['username'] ?? 'Player',
      email: json['email'],
      avatar: json['avatar'],
      isGuest: json['isGuest'] ?? false,
      level: json['level'] ?? 1,
      xp: json['xp'] ?? 0,
      stats: UserStats.fromJson(json['stats']),
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'username': username,
    'email': email,
    'avatar': avatar,
    'isGuest': isGuest,
    'level': level,
    'xp': xp,
    'stats': stats.toJson(),
  };
}
