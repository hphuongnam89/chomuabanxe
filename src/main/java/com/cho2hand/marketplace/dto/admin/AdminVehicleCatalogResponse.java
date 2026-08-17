package com.cho2hand.marketplace.dto.admin;

import java.util.List;

public record AdminVehicleCatalogResponse(List<AdminVehicleOptionResponse> brands,
        List<AdminVehicleOptionResponse> models, List<AdminVehicleOptionResponse> origins,
        List<AdminVehicleOptionResponse> transmissions, List<AdminVehicleOptionResponse> fuels,
        List<AdminVehicleOptionResponse> colors, List<AdminVehicleOptionResponse> bodyTypes,
        List<AdminVehicleOptionResponse> drivelines) { }
