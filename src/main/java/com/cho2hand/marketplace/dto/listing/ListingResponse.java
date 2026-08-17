package com.cho2hand.marketplace.dto.listing;
import com.cho2hand.marketplace.dto.vehicle.VehicleSpecResponse;
import java.math.BigDecimal;
import java.time.Instant;
public record ListingResponse(Long id, Long sellerUserId, Long categoryId, Long conditionId, Long locationId,
    String addressDetail, String title, String description, BigDecimal priceAmount, String currencyCode,
    Instant publishedAt, String coverImageUrl, VehicleSpecResponse vehicle) { }
