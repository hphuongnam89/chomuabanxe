package com.cho2hand.marketplace.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RateLimitFilterTest {
    @Test
    void limitsAuthRequestsPerIpAndRoute() throws Exception {
        var filter = new RateLimitFilter(false);
        FilterChain chain = (request, response) -> ((HttpServletResponse) response).setStatus(204);

        for (int i = 0; i < 5; i++) {
            var response = request(filter, chain);
            assertEquals(204, response.getStatus());
        }
        assertEquals(429, request(filter, chain).getStatus());
    }

    @Test
    void ignoresSpoofedForwardedHeaderWithoutTrustedProxy() throws Exception {
        var filter = new RateLimitFilter(false);
        FilterChain chain = (request, response) -> ((HttpServletResponse) response).setStatus(204);

        for (int i = 0; i < 5; i++) assertEquals(204, request(filter, chain, "198.51.100." + i).getStatus());
        assertEquals(429, request(filter, chain, "198.51.100.99").getStatus());
    }

    private MockHttpServletResponse request(RateLimitFilter filter, FilterChain chain) throws Exception {
        return request(filter, chain, null);
    }

    private MockHttpServletResponse request(RateLimitFilter filter, FilterChain chain, String forwardedFor) throws Exception {
        var request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("192.0.2.10");
        if (forwardedFor != null) request.addHeader("X-Forwarded-For", forwardedFor);
        var response = new MockHttpServletResponse();
        filter.doFilter(request, response, chain);
        return response;
    }
}
