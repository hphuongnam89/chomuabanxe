package com.cho2hand.marketplace.service.impl.location;

import com.cho2hand.marketplace.dto.location.LocationResponse;
import com.cho2hand.marketplace.entity.location.Location;
import com.cho2hand.marketplace.repository.location.LocationRepository;
import com.cho2hand.marketplace.service.location.LocationService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class LocationServiceImpl implements LocationService {
    private final LocationRepository locations;

    public LocationServiceImpl(LocationRepository locations) { this.locations = locations; }

    @Override
    public List<LocationResponse> getTree() {
        var all = locations.findByActiveTrueOrderByNameAsc();
        return all.stream().filter(location -> location.getParentLocationId() == null)
                .map(location -> toResponse(location, all)).toList();
    }

    private LocationResponse toResponse(Location location, List<Location> all) {
        // ponytail: the seeded two-level location tree is small; build an index only when it grows materially.
        var children = all.stream().filter(candidate -> location.getId().equals(candidate.getParentLocationId()))
                .map(candidate -> toResponse(candidate, all)).toList();
        return new LocationResponse(location.getId(), location.getName(), location.getCode(), location.getLevel(), children);
    }
}
