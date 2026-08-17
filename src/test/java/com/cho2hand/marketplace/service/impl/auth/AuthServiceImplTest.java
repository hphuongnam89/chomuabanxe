package com.cho2hand.marketplace.service.impl.auth;

import com.cho2hand.marketplace.dto.auth.LoginRequest;
import com.cho2hand.marketplace.entity.auth.UserAuthIdentity;
import com.cho2hand.marketplace.entity.auth.UserStatus;
import com.cho2hand.marketplace.entity.user.User;
import com.cho2hand.marketplace.mapper.auth.AuthMapper;
import com.cho2hand.marketplace.repository.auth.PasswordResetTokenRepository;
import com.cho2hand.marketplace.repository.auth.RoleRepository;
import com.cho2hand.marketplace.repository.auth.UserAuthIdentityRepository;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.auth.UserStatusRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import com.cho2hand.marketplace.security.JwtTokenProvider;
import com.cho2hand.marketplace.service.security.CaptchaService;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {
    @Test
    void loginReturnsJwtForActiveUser() {
        var users = mock(UserRepository.class);
        var identities = mock(UserAuthIdentityRepository.class);
        var statuses = mock(UserStatusRepository.class);
        var roles = mock(UserRoleRepository.class);
        var jwt = mock(JwtTokenProvider.class);
        var encoder = new BCryptPasswordEncoder();
        var identity = new UserAuthIdentity();
        identity.setUserId(7L);
        identity.setPasswordHash(encoder.encode("password123"));
        var user = new User();
        ReflectionTestUtils.setField(user, "id", 7L);
        user.setUserStatusId(1L);
        var active = new UserStatus();
        ReflectionTestUtils.setField(active, "id", 1L);
        when(identities.findByIdentityTypeAndNormalizedValue("EMAIL", "minh@example.com")).thenReturn(Optional.of(identity));
        when(users.findById(7L)).thenReturn(Optional.of(user));
        when(statuses.findByCodeAndActiveTrue("ACTIVE")).thenReturn(Optional.of(active));
        when(roles.findRoleCodesByUserId(7L)).thenReturn(List.of("USER"));
        when(jwt.generate(7L, List.of("USER"))).thenReturn("jwt");

        var service = new AuthServiceImpl(users, identities, statuses, mock(RoleRepository.class), roles,
                mock(PasswordResetTokenRepository.class), encoder, jwt, new AuthMapper(), mock(CaptchaService.class));

        var response = service.login(new LoginRequest("Minh@Example.com", "password123", null));

        assertEquals("jwt", response.accessToken());
        assertEquals(7L, response.userId());
        assertEquals(0, identity.getFailedLoginAttempts());
        assertNull(identity.getLockedUntil());
    }

    @Test
    void loginRejectsIncorrectPassword() {
        var identities = mock(UserAuthIdentityRepository.class);
        var identity = new UserAuthIdentity();
        identity.setPasswordHash(new BCryptPasswordEncoder().encode("password123"));
        when(identities.findByIdentityTypeAndNormalizedValue("EMAIL", "minh@example.com")).thenReturn(Optional.of(identity));
        var service = new AuthServiceImpl(mock(UserRepository.class), identities, mock(UserStatusRepository.class),
                mock(RoleRepository.class), mock(UserRoleRepository.class), mock(PasswordResetTokenRepository.class),
                new BCryptPasswordEncoder(), mock(JwtTokenProvider.class), new AuthMapper(), mock(CaptchaService.class));

        assertThrows(RuntimeException.class, () -> service.login(new LoginRequest("minh@example.com", "wrongpass", null)));
        assertEquals(1, identity.getFailedLoginAttempts());
        assertNull(identity.getLockedUntil());
    }

    @Test
    void loginTemporarilyLocksIdentityAfterRepeatedFailures() {
        var identities = mock(UserAuthIdentityRepository.class);
        var identity = new UserAuthIdentity();
        identity.setPasswordHash(new BCryptPasswordEncoder().encode("password123"));
        when(identities.findByIdentityTypeAndNormalizedValue("EMAIL", "minh@example.com")).thenReturn(Optional.of(identity));
        var service = new AuthServiceImpl(mock(UserRepository.class), identities, mock(UserStatusRepository.class),
                mock(RoleRepository.class), mock(UserRoleRepository.class), mock(PasswordResetTokenRepository.class),
                new BCryptPasswordEncoder(), mock(JwtTokenProvider.class), new AuthMapper(), mock(CaptchaService.class));

        for (int i = 0; i < 5; i++) {
            assertThrows(RuntimeException.class, () -> service.login(new LoginRequest("minh@example.com", "wrongpass", null)));
        }

        assertEquals(5, identity.getFailedLoginAttempts());
        assertNotNull(identity.getLockedUntil());
        assertThrows(RuntimeException.class, () -> service.login(new LoginRequest("minh@example.com", "password123", null)));
    }
}
