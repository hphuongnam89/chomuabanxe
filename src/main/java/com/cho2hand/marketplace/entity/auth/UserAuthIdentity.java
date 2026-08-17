package com.cho2hand.marketplace.entity.auth;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.Instant;

@Entity
@Table(name = "user_auth_identities", uniqueConstraints = @UniqueConstraint(columnNames = {"identity_type", "normalized_value"}))
public class UserAuthIdentity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identity_id")
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "identity_type", nullable = false, length = 16)
    private String identityType;

    @Column(name = "normalized_value", nullable = false, length = 255)
    private String normalizedValue;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "verified_at")
    private Instant verifiedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void createTimestamps() { createdAt = updatedAt = Instant.now(); }

    @PreUpdate
    void updateTimestamp() { updatedAt = Instant.now(); }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getIdentityType() { return identityType; }
    public void setIdentityType(String identityType) { this.identityType = identityType; }
    public String getNormalizedValue() { return normalizedValue; }
    public void setNormalizedValue(String normalizedValue) { this.normalizedValue = normalizedValue; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }
    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public Instant getLockedUntil() { return lockedUntil; }
    public boolean isLoginLocked(Instant now) { return lockedUntil != null && lockedUntil.isAfter(now); }
    public void unlockIfExpired(Instant now) {
        if (lockedUntil != null && !lockedUntil.isAfter(now)) clearLoginFailures();
    }
    public void recordFailedLogin(int maxAttempts, Instant lockUntil) {
        failedLoginAttempts++;
        if (failedLoginAttempts >= maxAttempts) lockedUntil = lockUntil;
    }
    public void clearLoginFailures() {
        failedLoginAttempts = 0;
        lockedUntil = null;
    }
}
