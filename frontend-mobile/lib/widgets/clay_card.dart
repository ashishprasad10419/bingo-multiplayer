import 'package:flutter/material.dart';
import '../core/theme/clay_theme.dart';

class ClayCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry padding;
  final double radius;
  final Color? backgroundColor;

  const ClayCard({
    super.key,
    required this.child,
    this.padding = const EdgeInsets.all(20),
    this.radius = 28,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: padding,
      decoration: BoxDecoration(
        color: backgroundColor ?? ClayColors.cardWhite,
        borderRadius: BorderRadius.circular(radius),
        border: Border.all(color: const Color(0xFFEDE8F8), width: 1.2),
        boxShadow: const [
          BoxShadow(
            color: Color(0x1F8773D7),
            blurRadius: 28,
            offset: Offset(0, 12),
          ),
          BoxShadow(
            color: Color(0x0E8773D7),
            blurRadius: 8,
            offset: Offset(0, 2),
          ),
        ],
      ),
      child: child,
    );
  }
}
