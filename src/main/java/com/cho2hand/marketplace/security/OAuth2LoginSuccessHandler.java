package com.cho2hand.marketplace.security;

import com.cho2hand.marketplace.service.auth.AuthService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {
    private final AuthService authService;
    private final boolean cookieSecure;
    public OAuth2LoginSuccessHandler(AuthService authService, @Value("${app.auth-cookie-secure:false}") boolean cookieSecure) {
        this.authService = authService;
        this.cookieSecure = cookieSecure;
    }
    @Override public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        var user = (OAuth2User) authentication.getPrincipal();
        var auth = authService.oauthLogin("GOOGLE", user.getAttribute("sub"), user.getAttribute("email"), user.getAttribute("name"));
        var cookie = ResponseCookie.from("CARX_TOKEN", auth.accessToken()).httpOnly(true).secure(cookieSecure)
                .sameSite("Lax").path("/").maxAge(Duration.ofHours(1)).build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        getRedirectStrategy().sendRedirect(request, response, "/oauth-success");
    }
}
