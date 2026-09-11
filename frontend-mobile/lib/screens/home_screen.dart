import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_card.dart';
import 'create_room_screen.dart';
import 'join_room_screen.dart';
import 'leaderboard_screen.dart';
import 'login_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final user = auth.user;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Header Bar
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            gradient: ClayColors.primaryGradient,
                            borderRadius: BorderRadius.circular(14),
                            boxShadow: const [
                              BoxShadow(
                                color: Color(0x3DF07391),
                                blurRadius: 12,
                                offset: Offset(0, 4),
                              ),
                            ],
                          ),
                          child: Center(
                            child: Text(
                              (user?.username ?? 'U').substring(0, 1).toUpperCase(),
                              style: const TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Hi, ${user?.username ?? 'Player'}! 👋',
                              style: const TextStyle(
                                color: ClayColors.textDark,
                                fontSize: 18,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            const Text(
                              'Ready for a match?',
                              style: TextStyle(
                                color: ClayColors.textMuted,
                                fontSize: 12,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        // Leaderboard Button
                        IconButton(
                          icon: const Icon(Icons.emoji_events_outlined, color: Color(0xFFF59E0B)),
                          onPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(builder: (_) => const LeaderboardScreen()),
                            );
                          },
                        ),
                        // Logout Button
                        IconButton(
                          icon: const Icon(Icons.logout, color: ClayColors.textMuted, size: 20),
                          onPressed: () async {
                            await auth.logout();
                            if (context.mounted) {
                              Navigator.of(context).pushReplacement(
                                MaterialPageRoute(builder: (_) => const LoginScreen()),
                              );
                            }
                          },
                        ),
                      ],
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 4 Pastel Stat Cards (Image 1 Dashboard style)
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        title: 'MATCHES',
                        value: '${user?.stats.totalGames ?? 0}',
                        bgColor: ClayColors.chipLilac,
                        textColor: ClayColors.chipLilacText,
                        icon: Icons.sports_esports_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        title: 'WIN RATE',
                        value: '${(user?.stats.winRate ?? 0).toStringAsFixed(0)}%',
                        bgColor: ClayColors.chipPeach,
                        textColor: ClayColors.chipPeachText,
                        icon: Icons.percent,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: _buildStatCard(
                        title: 'STREAK',
                        value: '${user?.stats.currentWinStreak ?? 0} 🔥',
                        bgColor: ClayColors.chipYellow,
                        textColor: ClayColors.chipYellowText,
                        icon: Icons.local_fire_department_outlined,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: _buildStatCard(
                        title: 'LEVEL',
                        value: 'Lvl ${user?.level ?? 1}',
                        bgColor: const Color(0xFFE3F2FD),
                        textColor: const Color(0xFF0284C7),
                        icon: Icons.star_outline,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 28),

                // Play Modes Clay Card
                ClayCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Play Bingo Multiplayer',
                        style: TextStyle(
                          color: ClayColors.textDark,
                          fontSize: 18,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                      const SizedBox(height: 6),
                      const Text(
                        'Host a private match with custom board sizes, or join a friends room with their 6-letter room code.',
                        style: TextStyle(
                          color: ClayColors.textMuted,
                          fontSize: 13,
                          height: 1.4,
                        ),
                      ),
                      const SizedBox(height: 22),
                      ClayButton(
                        text: 'Host New Room',
                        icon: const Icon(Icons.add_circle_outline, color: Colors.white, size: 20),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const CreateRoomScreen()),
                          );
                        },
                      ),
                      const SizedBox(height: 12),
                      ClayButton(
                        text: 'Join with Room Code',
                        variant: ClayButtonVariant.outline,
                        icon: const Icon(Icons.login, color: ClayColors.textDark, size: 18),
                        onPressed: () {
                          Navigator.of(context).push(
                            MaterialPageRoute(builder: (_) => const JoinRoomScreen()),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildStatCard({
    required String title,
    required String value,
    required Color bgColor,
    required Color textColor,
    required IconData icon,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(color: textColor.withValues(alpha: 0.2), width: 1),
        boxShadow: [
          BoxShadow(
            color: textColor.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: TextStyle(
                  color: textColor,
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 0.6,
                ),
              ),
              Icon(icon, color: textColor, size: 16),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: TextStyle(
              color: textColor,
              fontSize: 20,
              fontWeight: FontWeight.w900,
            ),
          ),
        ],
      ),
    );
  }
}
