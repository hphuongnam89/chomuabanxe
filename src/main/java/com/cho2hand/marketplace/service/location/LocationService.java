package com.cho2hand.marketplace.service.location;

import com.cho2hand.marketplace.dto.location.LocationResponse;
import java.util.List;

public interface LocationService {
    List<LocationResponse> getTree();
}
