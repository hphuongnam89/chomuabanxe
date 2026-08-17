package com.cho2hand.marketplace.entity.listing;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "listings")
public class Listing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "listing_id") private Long id;
    @Column(name = "seller_user_id", nullable = false, updatable = false) private Long sellerUserId;
    @Column(name = "category_id", nullable = false) private Long categoryId;
    @Column(name = "listing_status_id", nullable = false) private Long listingStatusId;
    @Column(name = "condition_id", nullable = false) private Long conditionId;
    @Column(name = "currency_code", nullable = false, columnDefinition = "char(3)") private String currencyCode;
    @Column(nullable = false, length = 180) private String title;
    @Column(nullable = false, columnDefinition = "TEXT") private String description;
    @Column(name = "price_amount", nullable = false, precision = 15, scale = 0) private BigDecimal priceAmount;
    @Column(name = "location_id", nullable = false) private Long locationId;
    @Column(name = "address_detail") private String addressDetail;
    @Column(name = "published_at") private Instant publishedAt;
    @Column(name = "archived_at") private Instant archivedAt;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @PrePersist void onCreate() { var now = Instant.now(); createdAt = updatedAt = now; }
    @PreUpdate void onUpdate() { updatedAt = Instant.now(); }
    public Long getId() { return id; } public Long getSellerUserId() { return sellerUserId; } public void setSellerUserId(Long v) { sellerUserId = v; }
    public Long getCategoryId() { return categoryId; } public void setCategoryId(Long v) { categoryId = v; }
    public Long getListingStatusId() { return listingStatusId; } public void setListingStatusId(Long v) { listingStatusId = v; }
    public Long getConditionId() { return conditionId; } public void setConditionId(Long v) { conditionId = v; }
    public String getCurrencyCode() { return currencyCode; } public void setCurrencyCode(String v) { currencyCode = v; }
    public String getTitle() { return title; } public void setTitle(String v) { title = v; }
    public String getDescription() { return description; } public void setDescription(String v) { description = v; }
    public BigDecimal getPriceAmount() { return priceAmount; } public void setPriceAmount(BigDecimal v) { priceAmount = v; }
    public Long getLocationId() { return locationId; } public void setLocationId(Long v) { locationId = v; }
    public String getAddressDetail() { return addressDetail; } public void setAddressDetail(String v) { addressDetail = v; }
    public Instant getPublishedAt() { return publishedAt; } public void setPublishedAt(Instant v) { publishedAt = v; }
    public Instant getArchivedAt() { return archivedAt; } public void setArchivedAt(Instant v) { archivedAt = v; }
    public Instant getCreatedAt() { return createdAt; }
}
