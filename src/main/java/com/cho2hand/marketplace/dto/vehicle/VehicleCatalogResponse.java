package com.cho2hand.marketplace.dto.vehicle;

import java.util.List;

public record VehicleCatalogResponse(List<VehicleOptionResponse> brands, List<VehicleOptionResponse> origins,
        List<VehicleOptionResponse> transmissions, List<VehicleOptionResponse> fuels, List<VehicleOptionResponse> colors,
        List<VehicleOptionResponse> bodyTypes, List<VehicleOptionResponse> drivelines) { }
