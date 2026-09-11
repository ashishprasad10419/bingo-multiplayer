import 'package:flutter/material.dart';
import '../core/theme/clay_theme.dart';

class BoardGridWidget extends StatelessWidget {
  final List<List<int>> board;
  final List<int> calledNumbers;
  final Map<int, String> calledByMap;
  final String currentUserId;
  final bool isMyTurn;
  final int? pendingPick;
  final bool isSetupMode;
  final Point<int>? selectedPos;
  final Function(int row, int col, int value)? onCellTap;

  const BoardGridWidget({
    super.key,
    required this.board,
    this.calledNumbers = const [],
    this.calledByMap = const {},
    required this.currentUserId,
    this.isMyTurn = false,
    this.pendingPick,
    this.isSetupMode = false,
    this.selectedPos,
    this.onCellTap,
  });

  @override
  Widget build(BuildContext context) {
    final size = board.length;
    if (size == 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(28),
        border: Border.all(color: const Color(0xFFE2D8F8), width: 1.5),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F8773D7),
            blurRadius: 28,
            offset: Offset(0, 10),
          ),
        ],
      ),
      child: AspectRatio(
        aspectRatio: 1.0,
        child: GridView.builder(
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: size,
            crossAxisSpacing: 6,
            mainAxisSpacing: 6,
          ),
          itemCount: size * size,
          itemBuilder: (context, index) {
            final row = index ~/ size;
            final col = index % size;
            final val = board[row][col];

            final isCalled = calledNumbers.contains(val);
            final isPendingThis = pendingPick == val;
            final callerId = calledByMap[val];
            final isMyPick = callerId == currentUserId;
            final isSelectedSetup = isSetupMode && selectedPos != null && selectedPos!.x == row && selectedPos!.y == col;

            // Tile Colors
            BoxDecoration tileDecoration;
            Color textColor;

            if (isPendingThis) {
              // 0ms Optimistic Pick Feedback: Vibrant emerald pulse
              tileDecoration = BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFA7F3D0), width: 3),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x6610B981),
                    blurRadius: 12,
                    offset: Offset(0, 4),
                  ),
                ],
              );
              textColor = Colors.white;
            } else if (isCalled) {
              if (isMyPick) {
                // Picked by current user: Mint/Emerald
                tileDecoration = BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF10B981), Color(0xFF047857)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x4010B981),
                      blurRadius: 8,
                      offset: Offset(0, 3),
                    ),
                  ],
                );
                textColor = Colors.white;
              } else {
                // Picked by opponent: Coral rose
                tileDecoration = BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFF8788A), Color(0xFFE11D48)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [
                    BoxShadow(
                      color: Color(0x40F8788A),
                      blurRadius: 8,
                      offset: Offset(0, 3),
                    ),
                  ],
                );
                textColor = Colors.white;
              }
            } else if (isSelectedSetup) {
              tileDecoration = BoxDecoration(
                color: const Color(0xFFF0ECFC),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: ClayColors.periwinkle, width: 3),
              );
              textColor = ClayColors.periwinkle;
            } else if (isMyTurn && !isSetupMode) {
              tileDecoration = BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE2D8F8), width: 1.5),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x1A8C78CD),
                    blurRadius: 8,
                    offset: Offset(0, 2),
                  ),
                ],
              );
              textColor = ClayColors.textDark;
            } else {
              tileDecoration = BoxDecoration(
                color: const Color(0xFFF5F1FC).withOpacity(0.8),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFEDE8F8), width: 1),
              );
              textColor = ClayColors.textLight;
            }

            return GestureDetector(
              onTap: () {
                if (onCellTap != null) {
                  onCellTap!(row, col, val);
                }
              },
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 150),
                decoration: tileDecoration,
                child: Center(
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      Text(
                        '$val',
                        style: TextStyle(
                          color: textColor,
                          fontWeight: FontWeight.w800,
                          fontSize: size > 7 ? 14 : (size > 5 ? 17 : 20),
                        ),
                      ),
                      if (isCalled || isPendingThis)
                        Positioned(
                          right: 4,
                          top: 4,
                          child: Icon(
                            isMyPick || isPendingThis ? Icons.check : Icons.star,
                            color: Colors.white.withOpacity(0.85),
                            size: size > 7 ? 10 : 13,
                          ),
                        ),
                    ],
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}

class Point<T> {
  final T x;
  final T y;
  const Point(this.x, this.y);
}
