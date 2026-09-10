package com.bingo.user;

import com.bingo.user.dto.UpdateUserRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User getProfile(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
    }

    public User updateProfile(String userId, UpdateUserRequest request) {
        User user = getProfile(userId);

        if (StringUtils.hasText(request.getUsername()) && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsername(request.getUsername())) {
                throw new IllegalArgumentException("Username already taken");
            }
            user.setUsername(request.getUsername().trim());
        }

        if (StringUtils.hasText(request.getAvatar())) {
            user.setAvatar(request.getAvatar().trim());
        }

        return userRepository.save(user);
    }
}
