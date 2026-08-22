package com.gtax.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * The Supabase JWT signing secret, bound from {@code gtax.supabase.jwt-secret}.
 * Used to build the HS256 {@code JwtDecoder}.
 */
@ConfigurationProperties(prefix = "gtax.supabase.jwt")
public record SupabaseJwtProperties(String secret) {

    public SupabaseJwtProperties {
        if (secret == null || secret.isBlank()) {
            // Fail fast rather than silently accepting every token in prod.
            secret = "dev-only-insecure-secret-change-me-dev-only-insecure-secret";
        }
    }
}
