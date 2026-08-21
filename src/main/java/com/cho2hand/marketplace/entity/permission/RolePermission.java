package com.cho2hand.marketplace.entity.permission;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import com.cho2hand.marketplace.entity.auth.Role;

/**
 * Entity representing role-permission assignments for RBAC.
 * Uses composite primary key (role_id, permission_id).
 * 
 * @author CarX Team
 */
@Entity
@Table(
    name = "role_permissions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_role_permissions", columnNames = "role_id, permission_id")
    }
)
public class RolePermission {

    /**
     * Embedded composite primary key.
     */
    @EmbeddedId
    private RolePermissionId id;

    /**
     * Foreign key to Role entity.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "role_id",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private Role role;

    /**
     * Foreign key to Permission entity.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
        name = "permission_id",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private Permission permission;

    // Constructors
    public RolePermission() {
        // Default constructor for JPA
    }

    public RolePermission(RolePermissionId id, Role role, Permission permission) {
        this.id = id;
        this.role = role;
        this.permission = permission;
    }

    // Getters and Setters
    @Override
    public String toString() {
        return "RolePermission{" +
               "id=" + id +
               ", role=" + role +
               ", permission=" + permission +
               '}';
    }

    public RolePermissionId getId() {
        return id;
    }

    public void setId(RolePermissionId id) {
        this.id = id;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
        if (role != null && this.id == null) {
            this.id = new RolePermissionId(role.getId(), null);
        }
    }

    public Permission getPermission() {
        return permission;
    }

    public void setPermission(Permission permission) {
        this.permission = permission;
        if (permission != null && this.id == null) {
            this.id = new RolePermissionId(null, permission.getId());
        }
    }

    /**
     * Convenience method to create a new RolePermission with given role and permission.
     */
    public static RolePermission create(Role role, Permission permission) {
        RolePermissionId id = new RolePermissionId(role.getId(), permission.getId());
        return new RolePermission(id, role, permission);
    }

    /**
     * Check if this role has the given permission.
     */
    public boolean hasPermission(Long roleId, Short permissionId) {
        return this.id != null &&
               this.id.getRoleId().equals(roleId) &&
               this.id.getPermissionId().equals(permissionId);
    }
}
