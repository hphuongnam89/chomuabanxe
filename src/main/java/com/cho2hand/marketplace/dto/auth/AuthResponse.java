package com.cho2hand.marketplace.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import java.util.List;

public record AuthResponse(@JsonIgnore String accessToken, String tokenType, Long userId, List<String> roles) { }
