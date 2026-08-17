package com.cho2hand.marketplace.entity.admin;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "admin_audit_logs")
public class AdminAuditLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "audit_id") private Long id;
    @Column(name = "admin_user_id", nullable = false) private Long adminUserId;
    @Column(nullable = false, length = 64) private String action;
    @Column(name = "target_type", nullable = false, length = 32) private String targetType;
    @Column(name = "target_id") private Long targetId;
    @Column(length = 500) private String details;
    @Column(name = "created_at", nullable = false, updatable = false) private Instant createdAt;
    @PrePersist void created() { createdAt = Instant.now(); }
    public Long getId() { return id; } public Long getAdminUserId() { return adminUserId; }
    public String getAction() { return action; } public String getTargetType() { return targetType; }
    public Long getTargetId() { return targetId; } public String getDetails() { return details; }
    public Instant getCreatedAt() { return createdAt; }
    public AdminAuditLog record(Long admin, String action, String targetType, Long targetId, String details) {
        this.adminUserId = admin; this.action = action; this.targetType = targetType;
        this.targetId = targetId; this.details = details; return this;
    }
}
