package com.cho2hand.marketplace.controller.location;

import com.cho2hand.marketplace.dto.location.LocationResponse;
import com.cho2hand.marketplace.service.location.LocationService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/locations")
public class LocationController {
    private final LocationService locations;

    public LocationController(LocationService locations) { this.locations = locations; }

    @GetMapping
    public List<LocationResponse> getTree() { return locations.getTree(); }
}
