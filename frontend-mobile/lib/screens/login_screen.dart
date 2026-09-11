import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../core/theme/clay_theme.dart';
import '../widgets/clay_button.dart';
import '../widgets/clay_card.dart';
import 'home_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _usernameController = TextEditingController();
  final _passwordController = TextEditingController();
  final _emailController = TextEditingController();
  bool _isRegister = false;
  bool _obscurePassword = true;

  @override
  void dispose() {
    _usernameController.dispose();
    _passwordController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final username = _usernameController.text.trim();
    final password = _passwordController.text.trim();
    final email = _emailController.text.trim();

    if (username.isEmpty || password.isEmpty) {
      _showError('Please enter both username and password');
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      if (_isRegister) {
        if (email.isEmpty) {
          _showError('Email is required for registration');
          return;
        }
        await auth.register(username, email, password);
      } else {
        await auth.login(username, password);
      }

      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (_) {
      if (mounted && auth.error != null) {
        _showError(auth.error!);
      }
    }
  }

  Future<void> _handleGuestPlay() async {
    final guestName = 'Player${DateTime.now().millisecondsSinceEpoch % 10000}';
    final auth = Provider.of<AuthProvider>(context, listen: false);
    try {
      await auth.guestLogin(guestName);
      if (!mounted) return;
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } catch (_) {
      if (mounted && auth.error != null) {
        _showError(auth.error!);
      }
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: const Color(0xFFDC2626),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(gradient: ClayColors.ambientGradient),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
              child: ClayCard(
                radius: 32,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Brand Icon
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        gradient: ClayColors.primaryGradient,
                        borderRadius: BorderRadius.circular(18),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x52F07391),
                            blurRadius: 16,
                            offset: Offset(0, 6),
                          ),
                        ],
                      ),
                      child: const Center(
                        child: Text(
                          'B',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),
                    Text(
                      _isRegister ? 'Create Account' : 'Welcome Back!',
                      style: const TextStyle(
                        color: ClayColors.textDark,
                        fontSize: 26,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _isRegister
                        ? 'Sign up to start playing multiplayer Bingo'
                        : 'Login to continue your winning streak',
                      textAlign: TextAlign.center,
                      style: const TextStyle(
                        color: ClayColors.textMuted,
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Username Input
                    TextField(
                      controller: _usernameController,
                      decoration: ClayTheme.inputDecoration(
                        hintText: 'Username',
                        prefixIcon: const Icon(Icons.person_outline, color: ClayColors.periwinkle, size: 20),
                      ),
                    ),
                    const SizedBox(height: 14),

                    // Email Input (if registering)
                    if (_isRegister) ...[
                      TextField(
                        controller: _emailController,
                        keyboardType: TextInputType.emailAddress,
                        decoration: ClayTheme.inputDecoration(
                          hintText: 'Email address',
                          prefixIcon: const Icon(Icons.email_outlined, color: ClayColors.periwinkle, size: 20),
                        ),
                      ),
                      const SizedBox(height: 14),
                    ],

                    // Password Input
                    TextField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: ClayTheme.inputDecoration(
                        hintText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outline, color: ClayColors.periwinkle, size: 20),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off : Icons.visibility,
                            color: ClayColors.textLight,
                            size: 18,
                          ),
                          onPressed: () {
                            setState(() => _obscurePassword = !_obscurePassword);
                          },
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Submit Button (Coral-Rose Gradient)
                    ClayButton(
                      text: _isRegister ? 'Sign Up' : 'Log In',
                      isLoading: auth.isLoading,
                      onPressed: _handleSubmit,
                    ),
                    const SizedBox(height: 14),

                    // Guest Play Button
                    ClayButton(
                      text: 'Play Instantly as Guest',
                      variant: ClayButtonVariant.outline,
                      onPressed: _handleGuestPlay,
                    ),
                    const SizedBox(height: 20),

                    // Toggle Login / Register
                    GestureDetector(
                      onTap: () {
                        setState(() => _isRegister = !_isRegister);
                      },
                      child: Text(
                        _isRegister
                          ? 'Already have an account? Log In'
                          : "Don't have an account? Sign Up",
                        style: const TextStyle(
                          color: ClayColors.periwinkle,
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
