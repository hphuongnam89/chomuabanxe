package com.cho2hand.marketplace.dto.admin;

import java.math.BigDecimal;
import java.time.Instant;

public record AdminListingResponse(Long id, String title, BigDecimal priceAmount, String currencyCode,
                                   Long sellerUserId, String sellerName, Long categoryId,
                                   Long statusId, String status, Instant publishedAt, Instant archivedAt) { }
