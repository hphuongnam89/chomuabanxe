package com.cho2hand.marketplace.controller.vehicle;

import com.cho2hand.marketplace.dto.vehicle.*;
import com.cho2hand.marketplace.service.vehicle.VehicleCatalogService;
import jakarta.validation.constraints.Positive;
import java.util.List;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vehicle-catalog")
public class VehicleCatalogController {
    private final VehicleCatalogService service;

    public VehicleCatalogController(VehicleCatalogService service) { this.service = service; }

    @GetMapping
    public VehicleCatalogResponse catalog() { return service.catalog(); }

    @GetMapping("/brands/{brandId}/models")
    public List<VehicleOptionResponse> models(@PathVariable @Positive Long brandId) { return service.models(brandId); }
}
