import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'core/theme/clay_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/game_provider.dart';
import 'screens/web_game_screen.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // Set immersive status bar styling matching clay canvas
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      statusBarBrightness: Brightness.light,
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => GameProvider()),
      ],
      child: const BingoApp(),
    ),
  );
}

class BingoApp extends StatelessWidget {
  const BingoApp({super.key});

  @override
  Widget build(BuildContext context) {
    // If opened via deep link intent (e.g. from WhatsApp /join/ABCD12 link)
    final defaultRoute = WidgetsBinding.instance.platformDispatcher.defaultRouteName;
    final initialUrl = (defaultRoute.isNotEmpty && defaultRoute != '/')
        ? (defaultRoute.startsWith('http')
            ? defaultRoute
            : 'https://bingo-multiplayer-delta.vercel.app$defaultRoute')
        : 'https://bingo-multiplayer-delta.vercel.app';

    return MaterialApp(
      title: 'Bingo Multiplayer',
      debugShowCheckedModeBanner: false,
      theme: ClayTheme.theme,
      home: WebGameScreen(initialUrl: initialUrl),
    );
  }
}
