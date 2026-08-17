package com.cho2hand.marketplace.service.impl.auth;

import com.cho2hand.marketplace.dto.auth.AuthResponse;
import com.cho2hand.marketplace.dto.auth.ChangePasswordRequest;
import com.cho2hand.marketplace.dto.auth.LoginRequest;
import com.cho2hand.marketplace.dto.auth.PasswordResetRequest;
import com.cho2hand.marketplace.dto.auth.RegisterRequest;
import com.cho2hand.marketplace.dto.auth.ResetPasswordRequest;
import com.cho2hand.marketplace.entity.auth.PasswordResetToken;
import com.cho2hand.marketplace.entity.auth.UserAuthIdentity;
import com.cho2hand.marketplace.entity.auth.UserRole;
import com.cho2hand.marketplace.entity.user.User;
import com.cho2hand.marketplace.exception.AuthenticationFailedException;
import com.cho2hand.marketplace.exception.DuplicateIdentityException;
import com.cho2hand.marketplace.exception.InvalidResetTokenException;
import com.cho2hand.marketplace.exception.LookupValueNotFoundException;
import com.cho2hand.marketplace.exception.UserNotFoundException;
import com.cho2hand.marketplace.mapper.auth.AuthMapper;
import com.cho2hand.marketplace.repository.auth.PasswordResetTokenRepository;
import com.cho2hand.marketplace.repository.auth.RoleRepository;
import com.cho2hand.marketplace.repository.auth.UserAuthIdentityRepository;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import com.cho2hand.marketplace.repository.auth.UserStatusRepository;
import com.cho2hand.marketplace.repository.user.UserRepository;
import com.cho2hand.marketplace.security.JwtTokenProvider;
import com.cho2hand.marketplace.service.auth.AuthService;
import com.cho2hand.marketplace.service.security.CaptchaService;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {
    private static final String EMAIL = "EMAIL";
    private static final String ACTIVE = "ACTIVE";
    private static final String USER = "USER";
    private static final int MAX_FAILED_LOGIN_ATTEMPTS = 5;
    private static final long LOGIN_LOCK_MINUTES = 15;
    private final UserRepository userRepository;
    private final UserAuthIdentityRepository identityRepository;
    private final UserStatusRepository userStatusRepository;
    private final RoleRepository roleRepository;
    private final UserRoleRepository userRoleRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthMapper authMapper;
    private final CaptchaService captchaService;

    public AuthServiceImpl(UserRepository userRepository, UserAuthIdentityRepository identityRepository,
                           UserStatusRepository userStatusRepository, RoleRepository roleRepository,
                           UserRoleRepository userRoleRepository, PasswordResetTokenRepository resetTokenRepository,
                           PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider, AuthMapper authMapper,
                           CaptchaService captchaService) {
        this.userRepository = userRepository;
        this.identityRepository = identityRepository;
        this.userStatusRepository = userStatusRepository;
        this.roleRepository = roleRepository;
        this.userRoleRepository = userRoleRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
        this.authMapper = authMapper;
        this.captchaService = captchaService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        captchaService.verify(request.captchaToken());
        var email = normalize(request.email());
        if (identityRepository.existsByIdentityTypeAndNormalizedValue(EMAIL, email)) throw new DuplicateIdentityException();
        var status = userStatusRepository.findByCodeAndActiveTrue(ACTIVE)
                .orElseThrow(() -> new LookupValueNotFoundException("User status", ACTIVE));
        var role = roleRepository.findByCodeAndActiveTrue(USER)
                .orElseThrow(() -> new LookupValueNotFoundException("Role", USER));
        var user = new User();
        user.setDisplayName(request.displayName());
        user.setUserStatusId(status.getId());
        user = userRepository.save(user);
        var identity = new UserAuthIdentity();
        identity.setUserId(user.getId());
        identity.setIdentityType(EMAIL);
        identity.setNormalizedValue(email);
        identity.setPasswordHash(passwordEncoder.encode(request.password()));
        identityRepository.save(identity);
        userRoleRepository.save(new UserRole(user.getId(), role.getId()));
        return response(user, List.of(USER));
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        captchaService.verify(request.captchaToken());
        var identity = findIdentity(request.email());
        var now = Instant.now();
        identity.unlockIfExpired(now);
        if (identity.isLoginLocked(now)) throw new AuthenticationFailedException();
        if (identity.getPasswordHash() == null || !passwordEncoder.matches(request.password(), identity.getPasswordHash())) {
            identity.recordFailedLogin(MAX_FAILED_LOGIN_ATTEMPTS, now.plus(LOGIN_LOCK_MINUTES, ChronoUnit.MINUTES));
            throw new AuthenticationFailedException();
        }
        var user = userRepository.findById(identity.getUserId()).orElseThrow(() -> new UserNotFoundException(identity.getUserId()));
        var active = userStatusRepository.findByCodeAndActiveTrue(ACTIVE)
                .orElseThrow(() -> new LookupValueNotFoundException("User status", ACTIVE));
        if (!active.getId().equals(user.getUserStatusId())) throw new AuthenticationFailedException();
        identity.clearLoginFailures();
        user.setLastActiveAt(Instant.now());
        return response(user, userRoleRepository.findRoleCodesByUserId(user.getId()));
    }

    @Override
    public AuthResponse oauthLogin(String provider, String subject, String email, String displayName) {
        var normalized = provider.toUpperCase(java.util.Locale.ROOT) + ":" + subject;
        var identity = identityRepository.findByIdentityTypeAndNormalizedValue("OAUTH", normalized).orElse(null);
        User user;
        if (identity == null) {
            var status = userStatusRepository.findByCodeAndActiveTrue(ACTIVE).orElseThrow(() -> new LookupValueNotFoundException("User status", ACTIVE));
            var role = roleRepository.findByCodeAndActiveTrue(USER).orElseThrow(() -> new LookupValueNotFoundException("Role", USER));
            user = new User(); user.setDisplayName(displayName == null || displayName.isBlank() ? email : displayName); user.setUserStatusId(status.getId()); user = userRepository.save(user);
            identity = new UserAuthIdentity(); identity.setUserId(user.getId()); identity.setIdentityType("OAUTH"); identity.setNormalizedValue(normalized); identity.setVerifiedAt(Instant.now()); identityRepository.save(identity); userRoleRepository.save(new UserRole(user.getId(), role.getId()));
        } else {
            var existingUserId = identity.getUserId();
            user = userRepository.findById(existingUserId).orElseThrow(() -> new UserNotFoundException(existingUserId));
        }
        user.setLastActiveAt(Instant.now());
        return response(user, userRoleRepository.findRoleCodesByUserId(user.getId()));
    }

    @Override
    public void requestPasswordReset(PasswordResetRequest request) {
        identityRepository.findByIdentityTypeAndNormalizedValue(EMAIL, normalize(request.email())).ifPresent(identity -> {
            var token = new PasswordResetToken();
            token.setIdentityId(identity.getId());
            token.setTokenHash(hash(randomToken()));
            token.setExpiresAt(Instant.now().plus(30, ChronoUnit.MINUTES));
            resetTokenRepository.save(token);
        });
    }

    @Override
    public void resetPassword(ResetPasswordRequest request) {
        var token = resetTokenRepository.findByTokenHashAndUsedAtIsNull(hash(request.token()))
                .filter(value -> value.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(InvalidResetTokenException::new);
        var identity = identityRepository.findById(token.getIdentityId()).orElseThrow(InvalidResetTokenException::new);
        identity.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        token.setUsedAt(Instant.now());
    }

    @Override
    public void changePassword(Long userId, ChangePasswordRequest request) {
        var identity = identityRepository.findByUserIdAndIdentityType(userId, EMAIL).orElseThrow(AuthenticationFailedException::new);
        if (!passwordEncoder.matches(request.currentPassword(), identity.getPasswordHash())) throw new AuthenticationFailedException();
        identity.setPasswordHash(passwordEncoder.encode(request.newPassword()));
    }

    private AuthResponse response(User user, List<String> roles) {
        return authMapper.toResponse(user, tokenProvider.generate(user.getId(), roles), roles);
    }

    private UserAuthIdentity findIdentity(String email) {
        return identityRepository.findByIdentityTypeAndNormalizedValue(EMAIL, normalize(email))
                .orElseThrow(AuthenticationFailedException::new);
    }

    private String normalize(String email) { return email.trim().toLowerCase(java.util.Locale.ROOT); }

    private String randomToken() {
        var bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private byte[] hash(String token) {
        try { return MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8)); }
        catch (java.security.NoSuchAlgorithmException exception) { throw new IllegalStateException(exception); }
    }
}
