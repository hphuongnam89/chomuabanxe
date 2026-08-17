package com.cho2hand.marketplace.dto.auth;

import com.cho2hand.marketplace.validation.ValidDisplayName;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @ValidDisplayName String displayName,
        @NotBlank @Email @Size(max = 255) String email,
        @NotBlank @Size(min = 8, max = 72) String password,
        @Size(max = 2048) String captchaToken) { }
