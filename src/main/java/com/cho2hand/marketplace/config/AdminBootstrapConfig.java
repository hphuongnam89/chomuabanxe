package com.cho2hand.marketplace.config;

import com.cho2hand.marketplace.entity.auth.UserAuthIdentity;
import com.cho2hand.marketplace.entity.auth.UserRole;
import com.cho2hand.marketplace.entity.auth.UserRoleId;
import com.cho2hand.marketplace.entity.user.User;
import com.cho2hand.marketplace.repository.auth.RoleRepository;
import com.cho2hand.marketplace.repository.auth.UserAuthIdentityRepository;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.auth.UserStatusRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import java.time.Instant;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

@Configuration
public class AdminBootstrapConfig {
    private static final Logger log = LoggerFactory.getLogger(AdminBootstrapConfig.class);

    @Bean
    ApplicationRunner adminBootstrap(AdminBootstrap bootstrap) {
        return args -> bootstrap.run();
    }

    @Configuration
    static class AdminBootstrap {
        private final String email;
        private final String password;
        private final UserRepository users;
        private final UserAuthIdentityRepository identities;
        private final UserStatusRepository statuses;
        private final RoleRepository roles;
        private final UserRoleRepository userRoles;
        private final PasswordEncoder encoder;

        AdminBootstrap(@Value("${ADMIN_BOOTSTRAP_EMAIL:}") String email,
                @Value("${ADMIN_BOOTSTRAP_PASSWORD:}") String password,
                UserRepository users, UserAuthIdentityRepository identities, UserStatusRepository statuses,
                RoleRepository roles, UserRoleRepository userRoles, PasswordEncoder encoder) {
            this.email = email; this.password = password; this.users = users; this.identities = identities;
            this.statuses = statuses; this.roles = roles; this.userRoles = userRoles; this.encoder = encoder;
        }

        @Transactional
        void run() {
            if (email.isBlank() || password.isBlank()) return;
            if (password.length() < 12) {
                log.warn("admin_bootstrap_skipped reason=weak_password");
                return;
            }
            var normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
            var identity = identities.findByIdentityTypeAndNormalizedValue("EMAIL", normalizedEmail).orElseGet(() -> createIdentity(normalizedEmail));
            var admin = roles.findByCodeAndActiveTrue("ADMIN").orElseThrow();
            var id = new UserRoleId(identity.getUserId(), admin.getId());
            if (!userRoles.existsById(id)) userRoles.save(new UserRole(identity.getUserId(), admin.getId()));
            log.info("admin_bootstrap_ready email={}", normalizedEmail);
        }

        private UserAuthIdentity createIdentity(String normalizedEmail) {
            var active = statuses.findByCodeAndActiveTrue("ACTIVE").orElseThrow();
            var user = new User();
            user.setUserStatusId(active.getId());
            user.setDisplayName("Admin");
            user = users.save(user);

            var identity = new UserAuthIdentity();
            identity.setUserId(user.getId());
            identity.setIdentityType("EMAIL");
            identity.setNormalizedValue(normalizedEmail);
            identity.setPasswordHash(encoder.encode(password));
            identity.setVerifiedAt(Instant.now());
            return identities.save(identity);
        }
    }
}
