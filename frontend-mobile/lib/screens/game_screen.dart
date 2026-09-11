import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/board_grid_widget.dart';
import '../widgets/clay_card.dart';
import '../widgets/emote_picker_widget.dart';
import '../widgets/floating_emotes_view.dart';
import 'winner_screen.dart';

class GameScreen extends StatelessWidget {
  const GameScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final gameProv = Provider.of<GameProvider>(context);
    final user = auth.user;
    final game = gameProv.game;
    final board = gameProv.board ?? [];

    // Navigate to winner screen once finished
    if (game != null && game.status == 'FINISHED') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const WinnerScreen()),
        );
      });
    }

    if (user == null || game == null || board.isEmpty) {
      return Scaffold(
        body: Container(
          width: double.infinity,
          decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
          child: const Center(
            child: CircularProgressIndicator(color: ClayColors.periwinkle),
          ),
        ),
      );
    }

    final isMyTurn = game.currentTurnUserId == user.id;
    final currentTurnPlayer = game.players.where((p) => p.userId == game.currentTurnUserId).firstOrNull;
    final pendingPick = gameProv.pendingPick;

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: Stack(
            children: [
              SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                child: Column(
                  children: [
                    // B-I-N-G-O Progress Banner
                    _buildBingoBanner(gameProv.lineCount, game.winningLines),
                    const SizedBox(height: 12),

                    // Turn Indicator Clay Banner
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: pendingPick != null
                            ? const Color(0xFFECFDF5)
                            : (isMyTurn ? const Color(0xFFF0ECFC) : Colors.white),
                        borderRadius: BorderRadius.circular(22),
                        border: Border.all(
                          color: pendingPick != null
                              ? const Color(0xFF10B981)
                              : (isMyTurn ? ClayColors.periwinkle : const Color(0xFFEDE8F8)),
                          width: isMyTurn || pendingPick != null ? 2 : 1,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: (pendingPick != null
                                    ? const Color(0xFF10B981)
                                    : (isMyTurn ? ClayColors.periwinkle : const Color(0xFF8773D7)))
                                .withOpacity(0.18),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Center(
                        child: pendingPick != null
                            ? Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const SizedBox(
                                    width: 16,
                                    height: 16,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      color: Color(0xFF10B981),
                                    ),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Picked #$pendingPick! Confirming...',
                                    style: const TextStyle(
                                      color: Color(0xFF047857),
                                      fontWeight: FontWeight.w800,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              )
                            : isMyTurn
                                ? const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(Icons.stars, color: Color(0xFFF59E0B), size: 18),
                                      SizedBox(width: 6),
                                      Text(
                                        "IT'S YOUR TURN! Tap a number",
                                        style: TextStyle(
                                          color: ClayColors.textDark,
                                          fontWeight: FontWeight.w800,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ],
                                  )
                                : Text(
                                    'Waiting for ${currentTurnPlayer?.username ?? 'player'}...',
                                    style: const TextStyle(
                                      color: ClayColors.textMuted,
                                      fontWeight: FontWeight.w700,
                                      fontSize: 12,
                                    ),
                                  ),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Interactive Live Board Grid
                    BoardGridWidget(
                      board: board,
                      calledNumbers: game.calledNumbers,
                      calledByMap: gameProv.calledByMap,
                      currentUserId: user.id,
                      isMyTurn: isMyTurn,
                      pendingPick: pendingPick,
                      onCellTap: (r, c, val) {
                        gameProv.callNumber(val, user.id);
                      },
                    ),
                    const SizedBox(height: 14),

                    // Emote Bar
                    EmotePickerWidget(
                      onEmoteSelected: (emote) {
                        gameProv.sendEmote(emote, user.id, user.username);
                      },
                    ),
                    const SizedBox(height: 16),

                    // Called Numbers History Pill Box
                    ClayCard(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              const Text(
                                'Called Numbers',
                                style: TextStyle(
                                  color: ClayColors.textDark,
                                  fontSize: 13,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                              Text(
                                '${game.calledNumbers.length}/${game.boardSize * game.boardSize}',
                                style: const TextStyle(
                                  color: ClayColors.textMuted,
                                  fontSize: 12,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 10),
                          SizedBox(
                            height: 36,
                            child: ListView.builder(
                              scrollDirection: Axis.horizontal,
                              itemCount: game.calledNumbers.length,
                              itemBuilder: (context, idx) {
                                final numVal = game.calledNumbers.reversed.toList()[idx];
                                return Container(
                                  margin: const EdgeInsets.only(right: 8),
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: idx == 0 ? ClayColors.periwinkle : ClayColors.chipLilac,
                                    borderRadius: BorderRadius.circular(50),
                                  ),
                                  child: Center(
                                    child: Text(
                                      '$numVal',
                                      style: TextStyle(
                                        color: idx == 0 ? Colors.white : ClayColors.chipLilacText,
                                        fontWeight: FontWeight.w900,
                                        fontSize: 12,
                                      ),
                                    ),
                                  ),
                                );
                              },
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              // Floating Emotes Overlay
              FloatingEmotesView(
                emotes: gameProv.activeEmotes,
                currentUserId: user.id,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBingoBanner(int lineCount, int target) {
    final letters = target <= 5
        ? ['B', 'I', 'N', 'G', 'O']
        : ['B', 'I', 'N', 'G', 'O', ...List.filled(target - 5, 'O')];
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: letters.asMap().entries.map((entry) {
          final idx = entry.key;
          final char = entry.value;
          final isCompleted = idx < lineCount;

          return AnimatedContainer(
            duration: const Duration(milliseconds: 250),
            margin: const EdgeInsets.symmetric(horizontal: 3),
            width: target > 7 ? 34 : 44,
            height: target > 7 ? 34 : 44,
          decoration: BoxDecoration(
            gradient: isCompleted ? ClayColors.primaryGradient : null,
            color: isCompleted ? null : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isCompleted ? Colors.transparent : const Color(0xFFEDE8F8),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: (isCompleted ? ClayColors.coral : const Color(0xFF8773D7)).withOpacity(0.2),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Center(
            child: Text(
              char,
              style: TextStyle(
                color: isCompleted ? Colors.white : ClayColors.textMuted,
                fontSize: 22,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
          );
        }).toList(),
      ),
    );
  }
}
