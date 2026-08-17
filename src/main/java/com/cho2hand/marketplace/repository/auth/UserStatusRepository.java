package com.cho2hand.marketplace.repository.auth;

import com.cho2hand.marketplace.entity.auth.UserStatus;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserStatusRepository extends JpaRepository<UserStatus, Long> {
    Optional<UserStatus> findByCodeAndActiveTrue(String code);
}
