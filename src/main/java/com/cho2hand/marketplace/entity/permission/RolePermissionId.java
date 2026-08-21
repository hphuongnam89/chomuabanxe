package com.cho2hand.marketplace.entity.permission;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serializable;

/**
 * Embedded primary key for RolePermission entity.
 * Composite key consisting of role_id and permission_id.
 * 
 * @author CarX Team
 */
@Embeddable
public class RolePermissionId implements Serializable {
    private static final long serialVersionUID = 1L;

    /**
     * Role ID (foreign key to Role entity).
     * Using BIGINT to match database schema.
     */
    @Column(name = "role_id", nullable = false, updatable = false)
    @Min(value = 1, message = "Role ID must be positive")
    private Long roleId;

    /**
     * Permission ID (foreign key to Permission entity).
     * Using SMALLINT to match database schema.
     */
    @Column(name = "permission_id", nullable = false, updatable = false)
    @Min(value = 1, message = "Permission ID must be positive")
    private Short permissionId;

    // Constructors
    public RolePermissionId() {
        // Default constructor for JPA
    }

    public RolePermissionId(Long roleId, Short permissionId) {
        this.roleId = roleId;
        this.permissionId = permissionId;
    }

    // Getters and Setters
    @Override
    public String toString() {
        return "RolePermissionId{" +
               "roleId=" + roleId +
               ", permissionId=" + permissionId +
               '}';
    }

    public Long getRoleId() {
        return roleId;
    }

    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }

    public Short getPermissionId() {
        return permissionId;
    }

    public void setPermissionId(Short permissionId) {
        this.permissionId = permissionId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        RolePermissionId that = (RolePermissionId) o;
        return roleId != null ? roleId.equals(that.roleId) : that.roleId == null &&
               permissionId != null ? permissionId.equals(that.permissionId) : that.permissionId == null;
    }

    @Override
    public int hashCode() {
        return java.util.Objects.hash(roleId, permissionId);
    }
}
