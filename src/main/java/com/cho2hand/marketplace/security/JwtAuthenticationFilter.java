package com.cho2hand.marketplace.security;

import com.cho2hand.marketplace.repository.user.UserRepository;
import com.cho2hand.marketplace.repository.auth.UserRoleRepository;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final UserRepository users;
    private final UserRoleRepository userRoles;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, UserRepository users, UserRoleRepository userRoles) {
        this.tokenProvider = tokenProvider;
        this.users = users;
        this.userRoles = userRoles;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        var header = request.getHeader("Authorization");
        var token = header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
        if (token == null && request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("CARX_TOKEN".equals(cookie.getName()) || "OLDMARKET_TOKEN".equals(cookie.getName())) {
                    token = cookie.getValue();
                    break;
                }
            }
        }
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                Claims claims = tokenProvider.parse(token);
                var userId = Long.valueOf(claims.getSubject());
                if (users.findById(userId).filter(user -> user.getUserStatusId() == 1L).isEmpty()) {
                    chain.doFilter(request, response);
                    return;
                }
                var roles = userRoles.findRoleCodesByUserId(userId).stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role)).toList();
                var permissions = userRoles.findPermissionCodesByUserId(userId).stream()
                        .map(permission -> new SimpleGrantedAuthority("PERM_" + permission)).toList();
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(userId, null,
                                java.util.stream.Stream.concat(roles.stream(), permissions.stream()).toList()));
            } catch (RuntimeException ignored) { }
        }
        chain.doFilter(request, response);
    }
}
