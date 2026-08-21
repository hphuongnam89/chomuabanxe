package com.cho2hand.marketplace.security;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Base64;
import java.util.List;
import org.junit.jupiter.api.Test;

class JwtTokenProviderTest {
    @Test
    void tokenCarriesAuthVersionAndParses() {
        var secret = Base64.getEncoder().encodeToString(new byte[32]);
        var provider = new JwtTokenProvider(new JwtProperties(secret, 60));

        var claims = provider.parse(provider.generate(7L, List.of("USER"), 3L));

        assertEquals("7", claims.getSubject());
        assertEquals(3L, ((Number) claims.get("auth_ver")).longValue());
    }
}
