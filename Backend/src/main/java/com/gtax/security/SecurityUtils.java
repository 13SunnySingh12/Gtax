package com.gtax.security;

import com.gtax.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * Helpers for reading the authenticated user out of the current Supabase JWT.
 * Every service scopes its queries to {@link #currentUserId()} so no user can
 * ever touch another user's rows (TRD §10 data scoping).
 */
public final class SecurityUtils {

    private SecurityUtils() {}

    /** The authenticated user's id, taken from the JWT {@code sub} claim. */
    public static UUID currentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof Jwt jwt)) {
            throw new UnauthorizedException("No authenticated user in the security context");
        }
        String sub = jwt.getSubject();
        if (sub == null || sub.isBlank()) {
            throw new UnauthorizedException("JWT is missing the 'sub' (user id) claim");
        }
        try {
            return UUID.fromString(sub);
        } catch (IllegalArgumentException e) {
            throw new UnauthorizedException("JWT 'sub' claim is not a valid user id");
        }
    }

    /** The authenticated user's email, if present in the token (used by profile). */
    public static String currentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            return jwt.getClaimAsString("email");
        }
        return null;
    }
}
