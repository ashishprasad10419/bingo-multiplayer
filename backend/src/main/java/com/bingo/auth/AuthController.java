package com.bingo.auth;

import com.bingo.auth.dto.AuthResponse;
import com.bingo.auth.dto.GuestRequest;
import com.bingo.auth.dto.LoginRequest;
import com.bingo.auth.dto.RegisterRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Authentication & Session endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register a new player account")
    public ResponseEntity<AuthResponse> register(
            @Valid @RequestBody RegisterRequest request,
            @RequestHeader(value = "X-Client-Type", required = false) String clientType,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.register(request, clientType, response));
    }

    @PostMapping("/login")
    @Operation(summary = "Login with username and password")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request,
            @RequestHeader(value = "X-Client-Type", required = false) String clientType,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.login(request, clientType, response));
    }

    @PostMapping("/guest")
    @Operation(summary = "Create an instant guest play session")
    public ResponseEntity<AuthResponse> createGuest(
            @Valid @RequestBody GuestRequest request,
            @RequestHeader(value = "X-Client-Type", required = false) String clientType,
            HttpServletResponse response
    ) {
        return ResponseEntity.ok(authService.createGuestSession(request, clientType, response));
    }

    @PostMapping("/logout")
    @Operation(summary = "Clear auth cookies and end session")
    public ResponseEntity<Map<String, String>> logout(HttpServletResponse response) {
        authService.logout(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
