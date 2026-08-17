package com.cho2hand.marketplace.repository.auth;

import com.cho2hand.marketplace.entity.auth.UserAuthIdentity;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserAuthIdentityRepository extends JpaRepository<UserAuthIdentity, Long> {
    Optional<UserAuthIdentity> findByIdentityTypeAndNormalizedValue(String identityType, String normalizedValue);
    Optional<UserAuthIdentity> findByUserIdAndIdentityType(Long userId, String identityType);
    boolean existsByIdentityTypeAndNormalizedValue(String identityType, String normalizedValue);
    long countByFailedLoginAttemptsGreaterThan(int attempts);
    long countByLockedUntilAfter(java.time.Instant now);
}
