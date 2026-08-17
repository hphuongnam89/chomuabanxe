package com.cho2hand.marketplace.repository.auth;

import com.cho2hand.marketplace.entity.auth.Role;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByCodeAndActiveTrue(String code);
}
