package com.cho2hand.marketplace.controller.auth;

import com.cho2hand.marketplace.dto.auth.AuthResponse;
import com.cho2hand.marketplace.dto.auth.ChangePasswordRequest;
import com.cho2hand.marketplace.dto.auth.LoginRequest;
import com.cho2hand.marketplace.dto.auth.PasswordResetRequest;
import com.cho2hand.marketplace.dto.auth.RegisterRequest;
import com.cho2hand.marketplace.dto.auth.ResetPasswordRequest;
import com.cho2hand.marketplace.service.auth.AuthService;
import jakarta.validation.Valid;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private static final String COOKIE_NAME = "CARX_TOKEN";
    private final AuthService authService;
    private final boolean cookieSecure;
    public AuthController(AuthService authService, @Value("${app.auth-cookie-secure:false}") boolean cookieSecure) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request, HttpServletResponse response) { return issue(authService.register(request), response); }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) { return issue(authService.login(request), response); }

    @GetMapping("/csrf")
    public Map<String, String> csrf(CsrfToken token) {
        return Map.of("token", token.getToken(), "headerName", token.getHeaderName());
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void logout(HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie("", Duration.ZERO).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, ResponseCookie.from("OLDMARKET_TOKEN", "").httpOnly(true)
                .secure(cookieSecure).sameSite("Lax").path("/").maxAge(Duration.ZERO).build().toString());
    }

    private AuthResponse issue(AuthResponse auth, HttpServletResponse response) {
        response.addHeader(HttpHeaders.SET_COOKIE, cookie(auth.accessToken(), Duration.ofHours(1)).toString());
        response.addHeader(HttpHeaders.SET_COOKIE, legacyCookie(Duration.ZERO).toString());
        return auth;
    }

    private ResponseCookie cookie(String value, Duration maxAge) {
        return ResponseCookie.from(COOKIE_NAME, value).httpOnly(true).secure(cookieSecure)
                .sameSite("Lax").path("/").maxAge(maxAge).build();
    }

    private ResponseCookie legacyCookie(Duration maxAge) {
        return ResponseCookie.from("OLDMARKET_TOKEN", "").httpOnly(true).secure(cookieSecure)
                .sameSite("Lax").path("/").maxAge(maxAge).build();
    }

    @PostMapping("/password-reset-requests")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public void requestPasswordReset(@Valid @RequestBody PasswordResetRequest request) { authService.requestPasswordReset(request); }

    @PostMapping("/password-resets")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) { authService.resetPassword(request); }

    @PostMapping("/password-changes")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(@AuthenticationPrincipal Long userId, @Valid @RequestBody ChangePasswordRequest request) { authService.changePassword(userId, request); }
}
