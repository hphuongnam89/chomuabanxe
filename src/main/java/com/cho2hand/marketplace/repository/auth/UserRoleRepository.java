package com.cho2hand.marketplace.repository.auth;

import com.cho2hand.marketplace.entity.auth.UserRole;
import com.cho2hand.marketplace.entity.auth.UserRoleId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    @Query("select r.code from UserRole ur join Role r on r.id = ur.id.roleId where ur.id.userId = :userId")
    List<String> findRoleCodesByUserId(@Param("userId") Long userId);
    @Query(value = "select distinct p.code from user_roles ur join role_permissions rp on rp.role_id = ur.role_id "
            + "join permissions p on p.permission_id = rp.permission_id "
            + "where ur.user_id = :userId and p.is_active = true", nativeQuery = true)
    List<String> findPermissionCodesByUserId(@Param("userId") Long userId);
    long countByIdRoleId(Long roleId);
}
