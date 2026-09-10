package com.bingo.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GuestRequest {
    @NotBlank(message = "Guest name is required")
    @Size(min = 2, max = 20, message = "Guest name must be between 2 and 20 characters")
    private String guestName;

    private String avatar;
}
