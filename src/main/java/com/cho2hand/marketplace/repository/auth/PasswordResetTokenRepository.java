package com.cho2hand.marketplace.repository.auth;

import com.cho2hand.marketplace.entity.auth.PasswordResetToken;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHashAndUsedAtIsNull(byte[] tokenHash);
}
