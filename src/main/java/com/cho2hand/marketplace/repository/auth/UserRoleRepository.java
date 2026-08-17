package com.cho2hand.marketplace.repository.auth;

import com.cho2hand.marketplace.entity.auth.UserRole;
import com.cho2hand.marketplace.entity.auth.UserRoleId;
import java.util.List;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {
    interface UserRoleCodeView {
        Long getUserId();
        String getRoleCode();
    }

    @Query("select r.code from UserRole ur join Role r on r.id = ur.id.roleId where ur.id.userId = :userId")
    List<String> findRoleCodesByUserId(@Param("userId") Long userId);
    @Query("select ur.id.userId as userId, r.code as roleCode from UserRole ur join Role r on r.id = ur.id.roleId where ur.id.userId in :userIds")
    List<UserRoleCodeView> findRoleCodesByUserIds(@Param("userIds") Collection<Long> userIds);
    @Query(value = "select distinct p.code from user_roles ur join role_permissions rp on rp.role_id = ur.role_id "
            + "join permissions p on p.permission_id = rp.permission_id "
            + "where ur.user_id = :userId and p.is_active = true", nativeQuery = true)
    List<String> findPermissionCodesByUserId(@Param("userId") Long userId);
    long countByIdRoleId(Long roleId);
}
