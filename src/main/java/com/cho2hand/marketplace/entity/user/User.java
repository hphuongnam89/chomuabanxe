package com.cho2hand.marketplace.entity.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "user_status_id", nullable = false)
    private Long userStatusId;

    @Column(name = "display_name", nullable = false, length = 100)
    private String displayName;

    @Column(name = "avatar_media_id")
    private Long avatarMediaId;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt;

    @Column(name = "last_active_at")
    private Instant lastActiveAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void createTimestamps() {
        var now = Instant.now();
        joinedAt = now;
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void updateTimestamp() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public Long getUserStatusId() { return userStatusId; }
    public void setUserStatusId(Long userStatusId) { this.userStatusId = userStatusId; }
    public String getDisplayName() { return displayName; }
    public void setDisplayName(String displayName) { this.displayName = displayName; }
    public Long getAvatarMediaId() { return avatarMediaId; }
    public void setAvatarMediaId(Long avatarMediaId) { this.avatarMediaId = avatarMediaId; }
    public Instant getJoinedAt() { return joinedAt; }
    public Instant getLastActiveAt() { return lastActiveAt; }
    public void setLastActiveAt(Instant lastActiveAt) { this.lastActiveAt = lastActiveAt; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
