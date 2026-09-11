import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_card.dart';
import 'board_setup_screen.dart';
import 'game_screen.dart';

class LobbyScreen extends StatefulWidget {
  final String roomCode;

  const LobbyScreen({super.key, required this.roomCode});

  @override
  State<LobbyScreen> createState() => _LobbyScreenState();
}

class _LobbyScreenState extends State<LobbyScreen> {
  bool _starting = false;

  @override
  void initState() {
    super.initState();
    _refreshRoom();
  }

  Future<void> _refreshRoom() async {
    final gameProv = Provider.of<GameProvider>(context, listen: false);
    await gameProv.fetchRoom(widget.roomCode);
  }

  Future<void> _handleStartGame() async {
    setState(() => _starting = true);
    try {
      await ApiClient().startGame(widget.roomCode);
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data?['message'] ?? 'Failed to start game')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to start game')),
        );
      }
    } finally {
      if (mounted) setState(() => _starting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final gameProv = Provider.of<GameProvider>(context);
    final room = gameProv.room;
    final isHost = room?.hostUserId == auth.user?.id;
    final myPlayer = room?.players.where((p) => p.userId == auth.user?.id).firstOrNull;
    final isLocked = myPlayer?.boardLocked ?? false;

    // If game has started, automatically navigate to GameScreen
    if (gameProv.game != null && gameProv.game!.status == 'PLAYING') {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const GameScreen()),
        );
      });
    }

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Match Lobby',
          style: TextStyle(color: ClayColors.textDark, fontWeight: FontWeight.w800),
        ),
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              children: [
                // Room Code Clay Banner
                ClayCard(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'ROOM CODE',
                            style: TextStyle(
                              color: ClayColors.textMuted,
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            widget.roomCode.toUpperCase(),
                            style: const TextStyle(
                              color: ClayColors.periwinkle,
                              fontSize: 26,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 2,
                            ),
                          ),
                        ],
                      ),
                      IconButton(
                        icon: const Icon(Icons.copy, color: ClayColors.periwinkle),
                        onPressed: () {
                          Clipboard.setData(ClipboardData(text: widget.roomCode.toUpperCase()));
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Room code copied! Share with friends.')),
                          );
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),

                // Player List Clay Card
                ClayCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Connected Players',
                            style: TextStyle(
                              color: ClayColors.textDark,
                              fontSize: 16,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: ClayColors.chipLilac,
                              borderRadius: BorderRadius.circular(50),
                            ),
                            child: Text(
                              '${room?.players.length ?? 0}/${room?.maxPlayers ?? 6}',
                              style: const TextStyle(
                                color: ClayColors.chipLilacText,
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),
                      if (room != null)
                        ...room.players.map((p) {
                          final isMe = p.userId == auth.user?.id;
                          return Container(
                            margin: const EdgeInsets.only(bottom: 10),
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: const Color(0xFFF9F7FD),
                              borderRadius: BorderRadius.circular(18),
                              border: Border.all(color: const Color(0xFFEDE8F8)),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 18,
                                  backgroundColor: ClayColors.periwinkle,
                                  child: Text(
                                    p.username.substring(0, 1).toUpperCase(),
                                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        '${p.username} ${isMe ? '(You)' : ''}',
                                        style: const TextStyle(
                                          color: ClayColors.textDark,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                        ),
                                      ),
                                      if (p.isHost)
                                        const Text(
                                          'Host',
                                          style: TextStyle(color: ClayColors.coral, fontSize: 11, fontWeight: FontWeight.w700),
                                        ),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: p.boardLocked ? ClayColors.chipMint : ClayColors.chipYellow,
                                    borderRadius: BorderRadius.circular(50),
                                  ),
                                  child: Text(
                                    p.boardLocked ? 'Ready' : 'Setting up...',
                                    style: TextStyle(
                                      color: p.boardLocked ? ClayColors.chipMintText : ClayColors.chipYellowText,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          );
                        }),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Board Setup CTA
                ClayButton(
                  text: isLocked ? 'Board Locked & Ready ✓' : 'Customize & Lock Board',
                  variant: isLocked ? ClayButtonVariant.outline : ClayButtonVariant.purple,
                  icon: Icon(isLocked ? Icons.check_circle : Icons.grid_view, size: 20),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(builder: (_) => BoardSetupScreen(roomCode: widget.roomCode)),
                    );
                  },
                ),
                const SizedBox(height: 12),

                // Host Start Game Button
                if (isHost)
                  ClayButton(
                    text: 'Start Match Now',
                    isLoading: _starting,
                    onPressed: _handleStartGame,
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
