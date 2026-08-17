package com.cho2hand.marketplace.entity.trust;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class SavedListingId implements Serializable {
    @Column(name = "user_id") private Long userId;
    @Column(name = "listing_id") private Long listingId;
    protected SavedListingId() { }
    public SavedListingId(Long userId, Long listingId) { this.userId = userId; this.listingId = listingId; }
    public Long getUserId() { return userId; }
    public Long getListingId() { return listingId; }
    @Override public boolean equals(Object other) { return other instanceof SavedListingId value && Objects.equals(userId, value.userId) && Objects.equals(listingId, value.listingId); }
    @Override public int hashCode() { return Objects.hash(userId, listingId); }
}
