package com.cho2hand.marketplace.dto.auth;

import java.util.List;

public record AuthResponse(String accessToken, String tokenType, Long userId, List<String> roles) { }
