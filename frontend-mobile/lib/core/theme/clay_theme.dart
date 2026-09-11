import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class ClayColors {
  // Pastel Canvas Gradient
  static const Color canvasStart = Color(0xFFD9D2FA);
  static const Color canvasMiddle = Color(0xFFE8E2FC);
  static const Color canvasEnd = Color(0xFFFDE2EA);
  static const Color canvasBg = Color(0xFFECE7F9);

  // Signatures Gradients (Coral Rose to Periwinkle)
  static const Color coral = Color(0xFFF8788A);
  static const Color orchidPink = Color(0xFFE271A5);
  static const Color periwinkle = Color(0xFF8B7FE8);
  static const Color periwinkleDark = Color(0xFF7B6EDC);

  // Typography
  static const Color textDark = Color(0xFF2A2050);
  static const Color textMuted = Color(0xFF7E749C);
  static const Color textLight = Color(0xFF9F96BA);

  // Pastel Surfaces & Chips
  static const Color cardWhite = Color(0xFFFFFFFF);
  static const Color inputBg = Color(0xFFF4EFFC);
  static const Color chipYellow = Color(0xFFFEF5DB);
  static const Color chipYellowText = Color(0xFFB45309);
  static const Color chipLilac = Color(0xFFF0ECFC);
  static const Color chipLilacText = Color(0xFF6D5EBD);
  static const Color chipMint = Color(0xFFE6F7EF);
  static const Color chipMintText = Color(0xFF047857);
  static const Color chipPeach = Color(0xFFFEE8EA);
  static const Color chipPeachText = Color(0xFFDC2626);

  // Primary Action Gradient
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [coral, orchidPink, periwinkle],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Ambient Canvas Gradient
  static const LinearGradient ambientGradient = LinearGradient(
    colors: [canvasStart, canvasMiddle, canvasEnd],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}

class ClayTheme {
  static ThemeData get theme {
    return ThemeData(
      useMaterial3: true,
      scaffoldBackgroundColor: ClayColors.canvasBg,
      textTheme: GoogleFonts.plusJakartaSansTextTheme(),
      colorScheme: ColorScheme.fromSeed(
        seedColor: ClayColors.periwinkle,
        primary: ClayColors.periwinkle,
        surface: ClayColors.cardWhite,
      ),
    );
  }

  // Soft Clay Card Box Decoration
  static BoxDecoration cardDecoration({double radius = 28}) {
    return BoxDecoration(
      color: ClayColors.cardWhite,
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
    );
  }

  // Pill Input Field Decoration
  static InputDecoration inputDecoration({
    required String hintText,
    Widget? prefixIcon,
    Widget? suffixIcon,
  }) {
    return InputDecoration(
      hintText: hintText,
      hintStyle: const TextStyle(
        color: ClayColors.textLight,
        fontWeight: FontWeight.w500,
        fontSize: 14,
      ),
      filled: true,
      fillColor: ClayColors.inputBg,
      prefixIcon: prefixIcon,
      suffixIcon: suffixIcon,
      contentPadding: const EdgeInsets.symmetric(horizontal: 22, vertical: 16),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(50),
        borderSide: BorderSide.none,
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(50),
        borderSide: BorderSide.none,
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(50),
        borderSide: const BorderSide(color: ClayColors.periwinkle, width: 2),
      ),
    );
  }
}
