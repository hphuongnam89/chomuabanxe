package com.cho2hand.marketplace.entity.permission;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * Entity representing system permissions for RBAC.
 * 
 * @author CarX Team
 */
@Entity
@Table(
    name = "permissions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_permissions_code", columnNames = "code")
    }
)
public class Permission {

    /**
     * Primary key - permission_id from database.
     * Using SMALLINT UNSIGNED to match database schema.
     */
    @Id
    @Column(name = "permission_id", nullable = false)
    @JdbcTypeCode(SqlTypes.SMALLINT)
    private Short id;

    /**
     * Permission code (e.g., 'customer.read', 'vehicle_catalog.write').
     * Used for permission checking and authorization.
     * Must be unique across all permissions.
     */
    @Column(name = "code", nullable = false, length = 64)
    @NotBlank(message = "Permission code is required")
    @Size(min = 1, max = 64, message = "Permission code must be between 1 and 64 characters")
    @Pattern(regexp = "^[a-z.]+$", message = "Permission code must contain only lowercase letters and dots")
    private String code;

    /**
     * Display name for the permission (shown in UI).
     */
    @Column(name = "display_name", nullable = false, length = 120)
    @NotBlank(message = "Permission display name is required")
    @Size(min = 1, max = 120, message = "Permission display name must be between 1 and 120 characters")
    private String displayName;

    /**
     * Indicates whether the permission is active.
     * Inactive permissions are not available for assignment.
     */
    @Column(name = "is_active", nullable = false)
    @JdbcTypeCode(SqlTypes.BOOLEAN)
    @NotNull(message = "Permission active status is required")
    private boolean isActive;

    // Constructors
    public Permission() {
        // Default constructor for JPA
    }

    public Permission(Short id, String code, String displayName, boolean isActive) {
        this.id = id;
        this.code = code;
        this.displayName = displayName;
        this.isActive = isActive;
    }

    // Getters and Setters
    @Override
    public String toString() {
        return "Permission{" +
               "id=" + id +
               ", code='" + code + '\'' +
               ", displayName='" + displayName + '\'' +
               ", isActive=" + isActive +
               '}';
    }

    public Short getId() {
        return id;
    }

    public void setId(Short id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public void setDisplayName(String displayName) {
        this.displayName = displayName;
    }

    public boolean isActive() {
        return isActive;
    }

    public void setActive(boolean active) {
        this.isActive = active;
    }
}