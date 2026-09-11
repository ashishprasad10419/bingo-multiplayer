import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:dio/dio.dart';
import '../core/api/api_client.dart';
import '../models/user.dart';

class AuthProvider extends ChangeNotifier {
  final ApiClient _api = ApiClient();
  User? _user;
  bool _isLoading = false;
  String? _error;

  User? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('bingo_token');
    if (token == null || token.isEmpty) return false;

    try {
      _isLoading = true;
      notifyListeners();
      _user = await _api.getMe();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (_) {
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> login(String username, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.login(username, password);
      _user = User.fromJson(res['user']);
      _isLoading = false;
      notifyListeners();
    } on DioException catch (e) {
      _isLoading = false;
      _error = e.response?.data?['message'] ?? 'Login failed. Check credentials.';
      notifyListeners();
      rethrow;
    } catch (e) {
      _isLoading = false;
      _error = 'An unexpected error occurred';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> register(String username, String email, String password, [String? avatar]) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.register(username, email, password, avatar);
      _user = User.fromJson(res['user']);
      _isLoading = false;
      notifyListeners();
    } on DioException catch (e) {
      _isLoading = false;
      _error = e.response?.data?['message'] ?? 'Registration failed.';
      notifyListeners();
      rethrow;
    } catch (e) {
      _isLoading = false;
      _error = 'An unexpected error occurred';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> guestLogin(String username) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final res = await _api.guestLogin(username);
      _user = User.fromJson(res['user']);
      _isLoading = false;
      notifyListeners();
    } on DioException catch (e) {
      _isLoading = false;
      _error = e.response?.data?['message'] ?? 'Guest login failed.';
      notifyListeners();
      rethrow;
    } catch (e) {
      _isLoading = false;
      _error = 'An unexpected error occurred';
      notifyListeners();
      rethrow;
    }
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('bingo_token');
    _user = null;
    notifyListeners();
  }
}
