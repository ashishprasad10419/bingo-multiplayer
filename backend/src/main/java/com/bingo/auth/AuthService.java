package com.bingo.auth;

import com.bingo.auth.dto.AuthResponse;
import com.bingo.auth.dto.GuestRequest;
import com.bingo.auth.dto.LoginRequest;
import com.bingo.auth.dto.RegisterRequest;
import com.bingo.user.User;
import com.bingo.user.UserRepository;
import com.bingo.user.UserStats;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Value("${jwt.cookie-name:token}")
    private String cookieName;

    public AuthResponse register(RegisterRequest request, String clientType, HttpServletResponse response) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already in use");
        }

        User user = User.builder()
                .username(request.getUsername().trim())
                .email(request.getEmail().trim().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .authProvider("LOCAL")
                .isGuest(false)
                .avatar(request.getAvatar() != null ? request.getAvatar() : "avatar_1")
                .stats(new UserStats())
                .level(1)
                .xp(0)
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user.getId(), user.getUsername(), false);
        attachAuthToken(token, clientType, response);

        return AuthResponse.builder()
                .token(token)
                .user(sanitize(user))
                .message("User registered successfully")
                .build();
    }

    public AuthResponse login(LoginRequest request, String clientType, HttpServletResponse response) {
        User user = userRepository.findByUsername(request.getUsername().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (user.isGuest() || user.getPasswordHash() == null) {
            throw new IllegalArgumentException("Invalid credentials for this account");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = jwtService.generateToken(user.getId(), user.getUsername(), false);
        attachAuthToken(token, clientType, response);

        return AuthResponse.builder()
                .token(token)
                .user(sanitize(user))
                .message("Login successful")
                .build();
    }

    public AuthResponse createGuestSession(GuestRequest request, String clientType, HttpServletResponse response) {
        String guestSuffix = UUID.randomUUID().toString().substring(0, 4);
        String username = request.getGuestName().trim() + "_" + guestSuffix;

        User guest = User.builder()
                .username(username)
                .authProvider("GUEST")
                .isGuest(true)
                .avatar(request.getAvatar() != null ? request.getAvatar() : "avatar_guest")
                .stats(new UserStats())
                .level(1)
                .xp(0)
                .build();

        guest = userRepository.save(guest);

        String token = jwtService.generateToken(guest.getId(), guest.getUsername(), true);
        attachAuthToken(token, clientType, response);

        return AuthResponse.builder()
                .token(token)
                .user(sanitize(guest))
                .message("Guest session created")
                .build();
    }

    public void logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from(cookieName, "")
                .httpOnly(true)
                .secure(false) // Set to true in prod HTTPS
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private void attachAuthToken(String token, String clientType, HttpServletResponse response) {
        // Dual-mode auth:
        // Web gets httpOnly cookie
        // Mobile gets token in AuthResponse JSON body
        if (clientType == null || !"mobile".equalsIgnoreCase(clientType)) {
            ResponseCookie cookie = ResponseCookie.from(cookieName, token)
                    .httpOnly(true)
                    .secure(false) // Set to true in production HTTPS
                    .path("/")
                    .maxAge(Duration.ofDays(7))
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        }
    }

    public User sanitize(User user) {
        User clean = new User();
        clean.setId(user.getId());
        clean.setUsername(user.getUsername());
        clean.setEmail(user.getEmail());
        clean.setAuthProvider(user.getAuthProvider());
        clean.setGuest(user.isGuest());
        clean.setAvatar(user.getAvatar());
        clean.setStats(user.getStats());
        clean.setLevel(user.getLevel());
        clean.setXp(user.getXp());
        clean.setCreatedAt(user.getCreatedAt());
        clean.setUpdatedAt(user.getUpdatedAt());
        return clean;
    }
}
