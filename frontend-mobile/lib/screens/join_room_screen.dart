import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api/api_client.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_card.dart';
import 'lobby_screen.dart';

class JoinRoomScreen extends StatefulWidget {
  const JoinRoomScreen({super.key});

  @override
  State<JoinRoomScreen> createState() => _JoinRoomScreenState();
}

class _JoinRoomScreenState extends State<JoinRoomScreen> {
  final _codeController = TextEditingController();
  bool _isLoading = false;

  Future<void> _handleJoin() async {
    final code = _codeController.text.trim().toUpperCase();
    if (code.length < 4) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter a valid room code')),
      );
      return;
    }

    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final gameProv = Provider.of<GameProvider>(context, listen: false);

    try {
      final room = await ApiClient().joinRoom(code);
      await gameProv.initSocket(room.roomCode, auth.user!.id);
      await gameProv.fetchRoom(room.roomCode);

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => LobbyScreen(roomCode: room.roomCode)),
      );
    } catch (e: any) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data?['message'] ?? 'Room not found or game already started')),
        );
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
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
          'Join Match',
          style: TextStyle(color: ClayColors.textDark, fontWeight: FontWeight.w800),
        ),
      ),
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: ClayCard(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Enter 6-Letter Room Code',
                    style: TextStyle(
                      color: ClayColors.textDark,
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                  const SizedBox(height: 6),
                  const Text(
                    'Ask your friend for the code shown in their lobby.',
                    style: TextStyle(color: ClayColors.textMuted, fontSize: 13),
                  ),
                  const SizedBox(height: 24),
                  TextField(
                    controller: _codeController,
                    textCapitalization: TextCapitalization.characters,
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 4,
                      color: ClayColors.periwinkle,
                    ),
                    decoration: ClayTheme.inputDecoration(
                      hintText: 'ABCDEF',
                    ),
                  ),
                  const SizedBox(height: 24),
                  ClayButton(
                    text: 'Join Room',
                    isLoading: _isLoading,
                    onPressed: _handleJoin,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
