package com.cho2hand.marketplace.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.Serial;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.concurrent.atomic.AtomicLong;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
public class RateLimitFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final long WINDOW_MILLIS = 60_000;
    private static final int MAX_WINDOWS = 10_000;
    private final Map<String, Window> windows = Collections.synchronizedMap(new LinkedHashMap<>(256, .75f, true) {
        @Serial private static final long serialVersionUID = 1L;
        @Override protected boolean removeEldestEntry(Map.Entry<String, Window> eldest) { return size() > MAX_WINDOWS; }
    });
    private final AtomicLong blockedRequests = new AtomicLong();
    private final boolean trustProxyHeaders;

    public RateLimitFilter(@Value("${app.rate-limit.trust-proxy-headers:false}") boolean trustProxyHeaders) {
        this.trustProxyHeaders = trustProxyHeaders;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain) throws ServletException, IOException {
        int limit = limit(request);
        if (limit > 0) {
            var ip = clientIp(request);
            var key = ip + ':' + request.getRequestURI();
            var window = windows.compute(key, (ignored, current) -> current == null || current.startedAt + WINDOW_MILLIS < System.currentTimeMillis()
                    ? new Window(System.currentTimeMillis(), 1) : new Window(current.startedAt, current.requests + 1));
            if (window.requests > limit) {
                blockedRequests.incrementAndGet();
                log.warn("rate_limit_exceeded ip={} method={} path={} requests={} limit={}", ip, request.getMethod(), request.getRequestURI(), window.requests, limit);
                response.setStatus(429);
                response.setContentType("application/problem+json");
                response.getWriter().write("{\"status\":429,\"detail\":\"Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.\"}");
                return;
            }
        }
        chain.doFilter(request, response);
    }

    public long blockedRequests() { return blockedRequests.get(); }

    private int limit(HttpServletRequest request) {
        var path = request.getRequestURI();
        if (path.startsWith("/api/v1/auth/")) return 5;
        if ("POST".equals(request.getMethod()) && path.equals("/api/v1/listings")) return 3;
        if ("POST".equals(request.getMethod()) && path.matches("/api/v1/listings/\\d+/images")) return 6;
        if ("POST".equals(request.getMethod()) && (path.contains("/messages") || path.contains("/reports") || path.contains("/comments"))) return 20;
        return 0;
    }

    private String clientIp(HttpServletRequest request) {
        if (!trustProxyHeaders) return request.getRemoteAddr();
        var forwarded = request.getHeader("X-Forwarded-For");
        return forwarded == null || forwarded.isBlank()
                ? request.getRemoteAddr() : forwarded.substring(forwarded.lastIndexOf(',') + 1).trim();
    }

    // ponytail: in-memory limits cover one container; replace with Redis only when multiple backend replicas are introduced.
    private record Window(long startedAt, int requests) { }
}
