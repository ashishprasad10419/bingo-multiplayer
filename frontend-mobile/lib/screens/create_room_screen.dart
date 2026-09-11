import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_card.dart';
import 'lobby_screen.dart';

class CreateRoomScreen extends StatefulWidget {
  const CreateRoomScreen({super.key});

  @override
  State<CreateRoomScreen> createState() => _CreateRoomScreenState();
}

class _CreateRoomScreenState extends State<CreateRoomScreen> {
  int _boardSize = 5;
  int _maxPlayers = 6;
  int _winningLines = 5;
  bool _isLoading = false;

  Future<void> _handleCreate() async {
    setState(() => _isLoading = true);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final gameProv = Provider.of<GameProvider>(context, listen: false);

    try {
      final room = await ApiClient().createRoom(
        boardSize: _boardSize,
        maxPlayers: _maxPlayers,
        winningLines: _winningLines,
      );
      await gameProv.initSocket(room.roomCode, auth.user!.id);
      await gameProv.fetchRoom(room.roomCode);

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => LobbyScreen(roomCode: room.roomCode)),
      );
    } on DioException catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data?['message'] ?? 'Failed to create room')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to create room')),
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
          'Create Game Room',
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
            child: ClayCard(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Board Size',
                    style: TextStyle(
                      color: ClayColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [5, 6, 7, 8, 9, 10].map((size) {
                      final isSelected = _boardSize == size;
                      return GestureDetector(
                        onTap: () {
                          setState(() {
                            _boardSize = size;
                            if (_winningLines > size) _winningLines = size;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? ClayColors.periwinkle : Colors.white,
                            borderRadius: BorderRadius.circular(50),
                            border: Border.all(
                              color: isSelected ? ClayColors.periwinkle : const Color(0xFFEDE8F8),
                            ),
                          ),
                          child: Text(
                            '${size}x$size',
                            style: TextStyle(
                              color: isSelected ? Colors.white : ClayColors.textDark,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'Max Players',
                    style: TextStyle(
                      color: ClayColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    children: [2, 3, 4, 5, 6].map((players) {
                      final isSelected = _maxPlayers == players;
                      return GestureDetector(
                        onTap: () => setState(() => _maxPlayers = players),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? ClayColors.coral : Colors.white,
                            borderRadius: BorderRadius.circular(50),
                            border: Border.all(
                              color: isSelected ? ClayColors.coral : const Color(0xFFEDE8F8),
                            ),
                          ),
                          child: Text(
                            '$players Players',
                            style: TextStyle(
                              color: isSelected ? Colors.white : ClayColors.textDark,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 24),

                  Text(
                    'Winning Target: $_winningLines Completed Lines',
                    style: const TextStyle(
                      color: ClayColors.textDark,
                      fontSize: 16,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                  Slider(
                    value: _winningLines.toDouble(),
                    min: 3,
                    max: _boardSize.toDouble(),
                    divisions: _boardSize - 3 > 0 ? _boardSize - 3 : 1,
                    activeColor: ClayColors.periwinkle,
                    onChanged: (val) => setState(() => _winningLines = val.toInt()),
                  ),
                  const SizedBox(height: 24),

                  ClayButton(
                    text: 'Create Room & Setup Board',
                    isLoading: _isLoading,
                    onPressed: _handleCreate,
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
