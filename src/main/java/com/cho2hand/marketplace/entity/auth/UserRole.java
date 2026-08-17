package com.cho2hand.marketplace.entity.auth;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "user_roles")
public class UserRole {
    @EmbeddedId
    private UserRoleId id;
    private Instant createdAt;

    protected UserRole() { }
    public UserRole(Long userId, Long roleId) { this.id = new UserRoleId(userId, roleId); }
    @PrePersist void createTimestamp() { createdAt = Instant.now(); }
    public UserRoleId getId() { return id; }
}
