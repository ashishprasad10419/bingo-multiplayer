package com.bingo.user;

import com.bingo.user.dto.UpdateUserRequest;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User", description = "User profile and history endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated player profile")
    public ResponseEntity<User> getCurrentUser(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @PatchMapping("/me")
    @Operation(summary = "Update player username or avatar")
    public ResponseEntity<User> updateProfile(
            @AuthenticationPrincipal String userId,
            @RequestBody UpdateUserRequest request
    ) {
        return ResponseEntity.ok(userService.updateProfile(userId, request));
    }
}
