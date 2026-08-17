package com.cho2hand.marketplace.dto.vehicle;

import jakarta.validation.constraints.*;

public record VehicleSpecRequest(
        @NotNull @Positive Long brandId,
        @NotNull @Positive Long modelId,
        @NotNull @Min(1886) @Max(2100) Integer manufactureYear,
        @NotNull @Positive Long transmissionId,
        @NotNull @Positive Long fuelId,
        @NotNull @Positive Long originId,
        @NotNull @Positive Long colorId,
        @NotNull @Positive Long bodyTypeId,
        @NotNull @Min(1) @Max(50) Integer seatCount,
        @NotNull @Positive Long drivelineId,
        @PositiveOrZero Integer mileageKm) { }
