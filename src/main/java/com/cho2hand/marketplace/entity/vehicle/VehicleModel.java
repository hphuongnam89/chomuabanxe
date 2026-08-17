package com.cho2hand.marketplace.entity.vehicle;

import jakarta.persistence.*;

@Entity
@Table(name = "vehicle_models")
public class VehicleModel {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "vehicle_model_id") private Long id;
    @Column(name = "vehicle_brand_id", nullable = false) private Long brandId;
    @Column(nullable = false, length = 64) private String code;
    @Column(nullable = false, length = 120) private String name;
    @Column(name = "sort_order", nullable = false) private short sortOrder;
    @Column(name = "is_active", nullable = false) private boolean active;

    public Long getId() { return id; }
    public Long getBrandId() { return brandId; }
    public String getCode() { return code; }
    public String getName() { return name; }
    public short getSortOrder() { return sortOrder; }
    public boolean isActive() { return active; }
}
