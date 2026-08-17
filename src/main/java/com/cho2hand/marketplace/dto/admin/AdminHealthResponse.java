package com.cho2hand.marketplace.dto.admin;
import java.time.Instant;
public record AdminHealthResponse(String api, String database, String storage, long rateLimitBlocks,
        long identitiesWithFailures, long lockedIdentities, Instant checkedAt) { }
