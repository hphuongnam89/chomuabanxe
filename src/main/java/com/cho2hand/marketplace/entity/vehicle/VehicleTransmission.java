package com.cho2hand.marketplace.entity.vehicle;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle_transmissions")
public class VehicleTransmission {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "vehicle_transmission_id") private Long id;
    @Column(nullable = false, unique = true, length = 64) private String code;
    @Column(name = "display_name", nullable = false, length = 120) private String displayName;
    @Column(name = "sort_order", nullable = false) private short sortOrder;
    @Column(name = "is_active", nullable = false) private boolean active;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public String getDisplayName() { return displayName; }
    public short getSortOrder() { return sortOrder; }
    public boolean isActive() { return active; }
}
