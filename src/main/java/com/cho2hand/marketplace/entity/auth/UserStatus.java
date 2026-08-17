package com.cho2hand.marketplace.entity.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "user_statuses")
public class UserStatus {
    @Id
    @Column(name = "user_status_id")
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    public Long getId() { return id; }
    public String getCode() { return code; }
    public boolean isActive() { return active; }
}
