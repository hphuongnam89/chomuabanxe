package com.cho2hand.marketplace.config;

import com.cho2hand.marketplace.security.JwtAuthenticationFilter;
import com.cho2hand.marketplace.security.RateLimitFilter;
import java.util.Arrays;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.Customizer;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import com.cho2hand.marketplace.security.OAuth2LoginSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(12); }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthenticationFilter jwtFilter, RateLimitFilter rateLimitFilter, OAuth2LoginSuccessHandler oauthSuccess) throws Exception {
        var csrfHandler = new CsrfTokenRequestAttributeHandler();
        csrfHandler.setCsrfRequestAttributeName(null);
        return http.csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(csrfHandler))
                .cors(Customizer.withDefaults())
                .exceptionHandling(exceptions -> exceptions.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .oauth2Login(oauth -> oauth
                        .authorizationEndpoint(endpoint -> endpoint.baseUri("/api/v1/auth/oauth2/authorization"))
                        .redirectionEndpoint(endpoint -> endpoint.baseUri("/api/v1/auth/login/oauth2/code/*"))
                        .successHandler(oauthSuccess)
                        .failureHandler((request, response, exception) ->
                                response.sendRedirect("/dang-nhap?oauthError=invalid_credentials")))
                .headers(headers -> headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'; base-uri 'self'; frame-ancestors 'none'; object-src 'none'"))
                        .frameOptions(frame -> frame.deny())
                        .contentTypeOptions(Customizer.withDefaults())
                        .httpStrictTransportSecurity(hsts -> hsts.includeSubDomains(true).maxAgeInSeconds(31536000))
                        .referrerPolicy(referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.POST, "/api/v1/auth/register", "/api/v1/auth/login",
                                "/api/v1/auth/logout", "/api/v1/auth/password-reset-requests", "/api/v1/auth/password-resets").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/csrf").permitAll()
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/api/v1/auth/oauth2/**", "/api/v1/auth/login/oauth2/**").permitAll()
                        .requestMatchers("/api/v1/categories/**", "/api/v1/locations/**", "/api/v1/vehicle-catalog/**", "/api/v1/storage/health", "/actuator/health", "/error").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/listings/mine").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/v1/listings/**", "/api/v1/sellers/*/trust-score", "/api/v1/users/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/stats", "/api/v1/admin/health").hasAuthority("PERM_system.read")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/users").hasAuthority("PERM_customer.read")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/admin/users/*/suspend", "/api/v1/admin/users/*/activate").hasAuthority("PERM_customer.update_status")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/listings", "/api/v1/admin/reports").hasAuthority("PERM_listing.read_admin")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/admin/listings/*").hasAuthority("PERM_listing.moderate")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/admin/listings/*/archive", "/api/v1/admin/listings/*/restore", "/api/v1/admin/reports/*/dismiss", "/api/v1/admin/reports/*/archive").hasAuthority("PERM_listing.moderate")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/vehicle-catalog", "/api/v1/admin/vehicle-catalog/**").hasAuthority("PERM_vehicle_catalog.read")
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/vehicle-catalog/**").hasAuthority("PERM_vehicle_catalog.write")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/vehicle-catalog/**").hasAuthority("PERM_vehicle_catalog.write")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/admin/vehicle-catalog/**").hasAuthority("PERM_vehicle_catalog.write")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/audit-logs").hasAuthority("PERM_audit.read")
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/roles", "/api/v1/admin/permissions").hasAuthority("PERM_staff.read")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/admin/users/*/roles").hasAuthority("PERM_staff.write")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                        .anyRequest().authenticated())
                .addFilterBefore(rateLimitFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(@Value("${app.cors.allowed-origins:http://localhost:8088}") String origins) {
        var config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.stream(origins.split(",")).map(String::trim).filter(value -> !value.isBlank()).toList());
        config.setAllowedMethods(java.util.List.of("GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(java.util.List.of(HttpHeaders.AUTHORIZATION, HttpHeaders.CONTENT_TYPE, "X-XSRF-TOKEN"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);
        var source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);
        return source;
    }
}
