import 'package:flutter/material.dart';
import '../providers/game_provider.dart';
import '../core/theme/clay_theme.dart';

class FloatingEmotesView extends StatelessWidget {
  final List<ActiveMobileEmote> emotes;
  final String currentUserId;

  const FloatingEmotesView({
    super.key,
    required this.emotes,
    required this.currentUserId,
  });

  @override
  Widget build(BuildContext context) {
    if (emotes.isEmpty) return const SizedBox.shrink();

    return Positioned(
      bottom: 90,
      right: 20,
      child: IgnorePointer(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          mainAxisSize: MainAxisSize.min,
          children: emotes.map((e) {
            final isMe = e.userId == currentUserId;
            return Container(
              margin: const EdgeInsets.only(bottom: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white.withValues(alpha: 0.95),
                borderRadius: BorderRadius.circular(50),
                border: Border.all(color: const Color(0xFFEDE8F8)),
                boxShadow: const [
                  BoxShadow(
                    color: Color(0x2E8C78CD),
                    blurRadius: 16,
                    offset: Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isMe ? ClayColors.chipMint : ClayColors.chipLilac,
                      borderRadius: BorderRadius.circular(50),
                    ),
                    child: Text(
                      isMe ? 'You' : e.username,
                      style: TextStyle(
                        color: isMe ? ClayColors.chipMintText : ClayColors.chipLilacText,
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    e.emote,
                    style: const TextStyle(fontSize: 24),
                  ),
                ],
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
