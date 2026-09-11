import 'dart:math';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../core/api/api_client.dart';
import '../providers/auth_provider.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/board_grid_widget.dart';
import '../widgets/clay_button.dart';

class BoardSetupScreen extends StatefulWidget {
  final String roomCode;

  const BoardSetupScreen({super.key, required this.roomCode});

  @override
  State<BoardSetupScreen> createState() => _BoardSetupScreenState();
}

class _BoardSetupScreenState extends State<BoardSetupScreen> {
  Point<int>? _selectedPos;
  bool _locking = false;

  @override
  void initState() {
    super.initState();
    _initBoard();
  }

  void _initBoard() {
    final gameProv = Provider.of<GameProvider>(context, listen: false);
    final auth = Provider.of<AuthProvider>(context, listen: false);
    final room = gameProv.room;
    final myPlayer = room?.players.where((p) => p.userId == auth.user?.id).firstOrNull;

    if (myPlayer?.board != null && myPlayer!.board!.isNotEmpty) {
      gameProv.setBoard(myPlayer.board!);
    } else {
      // Default generated numbers 1..(size*size)
      final size = room?.boardSize ?? 5;
      final numbers = List.generate(size * size, (i) => i + 1)..shuffle();
      final generated = List.generate(
        size,
        (r) => List.generate(size, (c) => numbers[r * size + c]),
      );
      gameProv.setBoard(generated);
    }
  }

  void _handleCellTap(int row, int col, int value) async {
    final gameProv = Provider.of<GameProvider>(context, listen: false);
    final board = gameProv.board;
    if (board == null) return;

    if (_selectedPos == null) {
      setState(() => _selectedPos = Point(row, col));
    } else {
      if (_selectedPos!.x == row && _selectedPos!.y == col) {
        setState(() => _selectedPos = null);
        return;
      }

      // Optimistic swap
      final newBoard = board.map((r) => List<int>.from(r)).toList();
      final temp = newBoard[_selectedPos!.x][_selectedPos!.y];
      newBoard[_selectedPos!.x][_selectedPos!.y] = newBoard[row][col];
      newBoard[row][col] = temp;
      gameProv.setBoard(newBoard);

      final from = {'row': _selectedPos!.x, 'column': _selectedPos!.y};
      final to = {'row': row, 'column': col};
      setState(() => _selectedPos = null);

      try {
        final serverBoard = await ApiClient().swapCells(widget.roomCode, from, to);
        gameProv.setBoard(serverBoard);
      } catch (_) {}
    }
  }

  void _handleShuffle() {
    final gameProv = Provider.of<GameProvider>(context, listen: false);
    final board = gameProv.board;
    if (board == null) return;

    final size = board.length;
    final allNumbers = board.expand((r) => r).toList()..shuffle();
    final shuffled = List.generate(
      size,
      (r) => List.generate(size, (c) => allNumbers[r * size + c]),
    );
    gameProv.setBoard(shuffled);
  }

  Future<void> _handleLock() async {
    setState(() => _locking = true);
    final gameProv = Provider.of<GameProvider>(context, listen: false);

    try {
      await ApiClient().lockBoard(widget.roomCode, gameProv.board);
      await gameProv.fetchRoom(widget.roomCode);
      if (!mounted) return;
      Navigator.of(context).pop();
    } catch (e: any) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.response?.data?['message'] ?? 'Failed to lock board')),
        );
      }
    } finally {
      if (mounted) setState(() => _locking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final gameProv = Provider.of<GameProvider>(context);
    final auth = Provider.of<AuthProvider>(context);
    final board = gameProv.board ?? [];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text(
          'Customize Your Board',
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
                const Text(
                  'Tap any two numbers to swap their positions on your board.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: ClayColors.textMuted,
                    fontSize: 13,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 18),

                // Interactive Board Grid
                BoardGridWidget(
                  board: board,
                  currentUserId: auth.user?.id ?? '',
                  isSetupMode: true,
                  selectedPos: _selectedPos,
                  onCellTap: _handleCellTap,
                ),
                const SizedBox(height: 20),

                // Shuffle & Lock Buttons
                Row(
                  children: [
                    Expanded(
                      child: ClayButton(
                        text: 'Shuffle',
                        variant: ClayButtonVariant.outline,
                        icon: const Icon(Icons.shuffle, size: 18),
                        onPressed: _handleShuffle,
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      flex: 2,
                      child: ClayButton(
                        text: 'Lock Board In',
                        isLoading: _locking,
                        icon: const Icon(Icons.lock, size: 18),
                        onPressed: _handleLock,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
