package com.cho2hand.marketplace.service.trust;

import java.util.List;

public interface SavedListingService {
    void save(Long userId, Long listingId);
    void remove(Long userId, Long listingId);
    List<Long> ids(Long userId);
}
