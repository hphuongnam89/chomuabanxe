package com.cho2hand.marketplace.dto.listing;

import java.math.BigDecimal;

public record ListingSearchRequest(String keyword, Long categoryId, Long conditionId, Long locationId, Long sellerUserId,
        BigDecimal minPrice, BigDecimal maxPrice, Long brandId, Long modelId, Integer minYear, Integer maxYear,
        Long transmissionId, Long fuelId, Long originId, Long colorId, Long bodyTypeId, Integer seatCount,
        Long drivelineId, Integer minMileageKm, Integer maxMileageKm, Long excludeId, String sort, int page, int size) { }
