package com.cho2hand.marketplace.dto.admin;
import java.math.BigDecimal;
public record AdminOperationsStatsResponse(long transactions,long confirmedTransactions,long reviews,
        long visibleReviews,BigDecimal averageRating,long notifications){}
