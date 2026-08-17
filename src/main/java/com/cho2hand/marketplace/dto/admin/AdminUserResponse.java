package com.cho2hand.marketplace.dto.admin;

import java.time.Instant;
import java.util.List;

public record AdminUserResponse(Long id, String displayName, Long statusId, String status,
                                Instant joinedAt, Instant lastActiveAt, long listingCount,
                                List<String> roles) { }
