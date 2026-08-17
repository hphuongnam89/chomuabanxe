package com.cho2hand.marketplace.entity.location;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "locations")
public class Location {
    @Id @Column(name = "location_id") private Long id;
    @Column(name = "parent_location_id") private Long parentLocationId;
    @Column(nullable = false) private byte level;
    @Column(nullable = false) private String name;
    @Column(nullable = false) private String code;
    @Column(name = "is_active") private boolean active;
    public Long getId() { return id; }
    public Long getParentLocationId() { return parentLocationId; }
    public byte getLevel() { return level; }
    public String getName() { return name; }
    public String getCode() { return code; }
    public boolean isActive() { return active; }
    public void setActive(boolean value) { active = value; }
}
