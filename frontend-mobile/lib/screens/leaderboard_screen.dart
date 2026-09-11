import 'package:flutter/material.dart';
import '../core/api/api_client.dart';
import '../models/user.dart';
import '../core/theme/clay_theme.dart';

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  List<User> _leaders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchLeaderboard();
  }

  Future<void> _fetchLeaderboard() async {
    try {
      final res = await ApiClient().dio.get('/leaderboard');
      final list = (res.data as List).map((u) => User.fromJson(u)).toList();
      setState(() {
        _leaders = list;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: ClayColors.textDark),
          onPressed: () => Navigator.of(context).pop(),
        ),
        title: const Text(
          'Top Players Leaderboard',
          style: TextStyle(color: ClayColors.textDark, fontWeight: FontWeight.w800),
        ),
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: _isLoading
              ? const Center(child: CircularProgressIndicator(color: ClayColors.periwinkle))
              : _leaders.isEmpty
                  ? const Center(
                      child: Text(
                        'No matches recorded yet. Play a match to get ranked!',
                        style: TextStyle(color: ClayColors.textMuted, fontWeight: FontWeight.w600),
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      itemCount: _leaders.length,
                      itemBuilder: (context, idx) {
                        final u = _leaders[idx];
                        final rank = idx + 1;

                        Color rankBadgeColor = ClayColors.chipLilac;
                        Color rankTextColor = ClayColors.chipLilacText;
                        String rankEmoji = '$rank';

                        if (rank == 1) {
                          rankBadgeColor = ClayColors.chipYellow;
                          rankTextColor = ClayColors.chipYellowText;
                          rankEmoji = '🥇';
                        } else if (rank == 2) {
                          rankBadgeColor = const Color(0xFFF1F5F9);
                          rankTextColor = const Color(0xFF475569);
                          rankEmoji = '🥈';
                        } else if (rank == 3) {
                          rankBadgeColor = ClayColors.chipPeach;
                          rankTextColor = ClayColors.chipPeachText;
                          rankEmoji = '🥉';
                        }

                        return Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(22),
                            border: Border.all(color: const Color(0xFFEDE8F8)),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x148773D7),
                                blurRadius: 10,
                                offset: Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: rankBadgeColor,
                                  shape: BoxShape.circle,
                                ),
                                child: Center(
                                  child: Text(
                                    rankEmoji,
                                    style: TextStyle(
                                      color: rankTextColor,
                                      fontWeight: FontWeight.w900,
                                      fontSize: rank <= 3 ? 16 : 13,
                                    ),
                                  ),
                                ),
                              ),
                              const SizedBox(width: 14),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      u.username,
                                      style: const TextStyle(
                                        color: ClayColors.textDark,
                                        fontWeight: FontWeight.w800,
                                        fontSize: 15,
                                      ),
                                    ),
                                    Text(
                                      'Level ${u.level} • ${u.stats.totalGames} Matches',
                                      style: const TextStyle(
                                        color: ClayColors.textMuted,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Text(
                                    '${u.stats.totalWins} Wins',
                                    style: const TextStyle(
                                      color: ClayColors.periwinkle,
                                      fontWeight: FontWeight.w800,
                                      fontSize: 14,
                                    ),
                                  ),
                                  if (u.stats.currentWinStreak > 0)
                                    Text(
                                      '${u.stats.currentWinStreak} Streak 🔥',
                                      style: const TextStyle(
                                        color: Color(0xFFF59E0B),
                                        fontSize: 11,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                        );
                      },
                    ),
        ),
      ),
    );
  }
}
