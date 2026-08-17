package com.cho2hand.marketplace.dto.vehicle;

public record VehicleSpecResponse(Long brandId, Long modelId, Integer manufactureYear, Long transmissionId,
        Long fuelId, Long originId, Long colorId, Long bodyTypeId, Integer seatCount, Long drivelineId,
        Integer mileageKm) { }
