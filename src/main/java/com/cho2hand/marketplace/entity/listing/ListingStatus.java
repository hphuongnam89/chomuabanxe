package com.cho2hand.marketplace.entity.listing;
import jakarta.persistence.*;
@Entity @Table(name = "listing_statuses") public class ListingStatus { @Id @Column(name = "listing_status_id") private Long id; @Column(nullable=false) private String code; @Column(name="is_active") private boolean active; public Long getId(){return id;} public String getCode(){return code;} }
