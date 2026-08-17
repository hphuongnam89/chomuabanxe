package com.cho2hand.marketplace.dto.user;

import java.time.Instant;
import java.util.List;

public record UserResponse(Long id, Long userStatusId, String displayName, Long avatarMediaId,
                           Instant joinedAt, Instant lastActiveAt, List<String> roles) { }
