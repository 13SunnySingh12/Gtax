package com.gtax.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory, per-user fixed-window rate limiter (no external deps). Runs
 * after JWT authentication so it can key on the user id. Only guards {@code /api/**}
 * (excluding the public health probe). AI-heavy endpoints get a stricter budget.
 * Fails open on any internal error so it can never take the API down.
 * Instantiated inside the Spring Security chain (not a @Component) so it always
 * runs AFTER JWT authentication, where the user id is available.
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private static final int GENERAL_LIMIT_PER_MIN = 120;
    private static final int AI_LIMIT_PER_MIN = 30;
    private static final long WINDOW_MS = 60_000L;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final ConcurrentHashMap<String, Window> windows = new ConcurrentHashMap<>();

    private record Window(long startMs, AtomicInteger count) {}

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Guard only the authenticated API; skip health, actuator, CORS preflight.
        return !path.startsWith("/api/")
                || path.startsWith("/api/health")
                || "OPTIONS".equalsIgnoreCase(request.getMethod());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        try {
            String userId = currentUserId();
            if (userId != null) {
                boolean heavy = isAiHeavy(request);
                int limit = heavy ? AI_LIMIT_PER_MIN : GENERAL_LIMIT_PER_MIN;
                String key = userId + (heavy ? ":ai" : ":gen");
                if (!allow(key, limit)) {
                    tooManyRequests(response);
                    return;
                }
            }
        } catch (Exception ignored) {
            // Fail open — never block the API because of the limiter itself.
        }
        chain.doFilter(request, response);
    }

    private boolean allow(String key, int limit) {
        long now = System.currentTimeMillis();
        Window w = windows.compute(key, (k, existing) -> {
            if (existing == null || now - existing.startMs() >= WINDOW_MS) {
                return new Window(now, new AtomicInteger(0));
            }
            return existing;
        });
        return w.count().incrementAndGet() <= limit;
    }

    private boolean isAiHeavy(HttpServletRequest request) {
        String p = request.getRequestURI();
        return p.equals("/api/chat/ask")
                || p.equals("/api/expenses/upload-receipt")
                || p.endsWith("/deduction-suggestions");
    }

    private String currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getSubject();
        }
        return null;
    }

    private void tooManyRequests(HttpServletResponse response) throws IOException {
        response.setStatus(429);
        response.setHeader("Retry-After", "60");
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getWriter(), Map.of(
                "timestamp", Instant.now().toString(),
                "status", 429,
                "error", "Too Many Requests",
                "message", "You're doing that a bit too fast. Please wait a minute and try again."));
    }
}
