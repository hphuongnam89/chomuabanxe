package com.cho2hand.marketplace.dto.admin;
import java.time.Instant;
public record AdminAuditResponse(Long id, Long adminUserId, String adminName, String action,
        String targetType, Long targetId, String details, Instant createdAt) { }
