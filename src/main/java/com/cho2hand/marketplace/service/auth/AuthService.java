package com.cho2hand.marketplace.service.auth;

import com.cho2hand.marketplace.dto.auth.AuthResponse;
import com.cho2hand.marketplace.dto.auth.ChangePasswordRequest;
import com.cho2hand.marketplace.dto.auth.LoginRequest;
import com.cho2hand.marketplace.dto.auth.PasswordResetRequest;
import com.cho2hand.marketplace.dto.auth.RegisterRequest;
import com.cho2hand.marketplace.dto.auth.ResetPasswordRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse oauthLogin(String provider, String subject, String email, String displayName);
    void requestPasswordReset(PasswordResetRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(Long userId, ChangePasswordRequest request);
}
