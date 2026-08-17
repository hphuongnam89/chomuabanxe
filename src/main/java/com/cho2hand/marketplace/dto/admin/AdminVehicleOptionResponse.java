package com.cho2hand.marketplace.dto.admin;

public record AdminVehicleOptionResponse(Long id, Long parentId, String code, String name,
        short sortOrder, boolean active) { }
