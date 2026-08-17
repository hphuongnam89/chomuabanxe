package com.cho2hand.marketplace.service.impl.trust;

import com.cho2hand.marketplace.entity.trust.SavedListing;
import com.cho2hand.marketplace.entity.trust.SavedListingId;
import com.cho2hand.marketplace.exception.ListingNotFoundException;
import com.cho2hand.marketplace.repository.listing.ListingRepository;
import com.cho2hand.marketplace.repository.trust.SavedListingRepository;
import com.cho2hand.marketplace.service.trust.SavedListingService;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class SavedListingServiceImpl implements SavedListingService {
    private final SavedListingRepository savedListings;
    private final ListingRepository listings;
    public SavedListingServiceImpl(SavedListingRepository savedListings, ListingRepository listings) { this.savedListings = savedListings; this.listings = listings; }
    public void save(Long userId, Long listingId) {
        if (listings.findById(listingId).filter(listing -> listing.getArchivedAt() == null).isEmpty()) throw new ListingNotFoundException(listingId);
        var id = new SavedListingId(userId, listingId);
        if (!savedListings.existsById(id)) savedListings.save(new SavedListing(userId, listingId));
    }
    public void remove(Long userId, Long listingId) { savedListings.deleteById(new SavedListingId(userId, listingId)); }
    @Transactional(readOnly = true) public List<Long> ids(Long userId) { return savedListings.findByIdUserIdOrderByCreatedAtDesc(userId).stream().map(saved -> saved.getId().getListingId()).toList(); }
}
