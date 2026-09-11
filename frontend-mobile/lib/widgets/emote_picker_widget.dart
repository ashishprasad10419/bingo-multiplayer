import 'package:flutter/material.dart';
import '../core/theme/clay_theme.dart';

class EmotePickerWidget extends StatelessWidget {
  final Function(String emote) onEmoteSelected;

  const EmotePickerWidget({
    super.key,
    required this.onEmoteSelected,
  });

  static const List<String> emotes = ['👏', '🔥', '🎯', '😂', '😮', '🥳'];

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(50),
        border: Border.all(color: const Color(0xFFEDE8F8)),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F8C78CD),
            blurRadius: 18,
            offset: Offset(0, 6),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text(
            'REACT:',
            style: TextStyle(
              color: ClayColors.periwinkle,
              fontSize: 10,
              fontWeight: FontWeight.w800,
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(width: 8),
          ...emotes.map((e) => GestureDetector(
                onTap: () => onEmoteSelected(e),
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 6),
                  child: Text(
                    e,
                    style: const TextStyle(fontSize: 22),
                  ),
                ),
              )),
        ],
      ),
    );
  }
}
