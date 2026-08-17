package com.cho2hand.marketplace.entity.trust;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "saved_listings")
public class SavedListing {
    @EmbeddedId private SavedListingId id;
    private Instant createdAt;
    protected SavedListing() { }
    public SavedListing(Long userId, Long listingId) { id = new SavedListingId(userId, listingId); }
    @PrePersist void created() { createdAt = Instant.now(); }
    public SavedListingId getId() { return id; }
}
