package com.cho2hand.marketplace.repository.trust;

import com.cho2hand.marketplace.entity.trust.SavedListing;
import com.cho2hand.marketplace.entity.trust.SavedListingId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SavedListingRepository extends JpaRepository<SavedListing, SavedListingId> {
    List<SavedListing> findByIdUserIdOrderByCreatedAtDesc(Long userId);
}
