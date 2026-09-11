import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_card.dart';
import 'home_screen.dart';

class WinnerScreen extends StatelessWidget {
  const WinnerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final gameProv = Provider.of<GameProvider>(context);
    final hasWon = gameProv.hasWon;
    final winnerUsername = gameProv.winnerUsername ?? 'Player';

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: ClayCard(
                radius: 32,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Trophy / Crown Icon
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        gradient: ClayColors.primaryGradient,
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x66F07391),
                            blurRadius: 24,
                            offset: Offset(0, 10),
                          ),
                        ],
                      ),
                      child: Center(
                        child: Text(
                          hasWon ? '🏆' : '🎉',
                          style: const TextStyle(fontSize: 42),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    Text(
                      hasWon ? 'VICTORY!' : 'GAME OVER!',
                      style: TextStyle(
                        color: hasWon ? const Color(0xFF047857) : ClayColors.textDark,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
                      ),
                    ),
                    const SizedBox(height: 10),

                    Text(
                      hasWon
                          ? 'You achieved B-I-N-G-O first!'
                          : '$winnerUsername claimed B-I-N-G-O!',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: ClayColors.textMuted,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Winner Podium Chip
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      decoration: BoxDecoration(
                        color: ClayColors.chipYellow,
                        borderRadius: BorderRadius.circular(50),
                        border: Border.all(color: const Color(0xFFFDE7AD)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.emoji_events, color: Color(0xFFB45309), size: 20),
                          const SizedBox(width: 8),
                          Text(
                            'Winner: $winnerUsername',
                            style: const TextStyle(
                              color: Color(0xFFB45309),
                              fontWeight: FontWeight.w800,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 36),

                    // Return Home Button
                    ClayButton(
                      text: 'Play Another Match',
                      onPressed: () {
                        gameProv.reset();
                        Navigator.of(context).pushAndRemoveUntil(
                          MaterialPageRoute(builder: (_) => const HomeScreen()),
                          (route) => false,
                        );
                      },
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
