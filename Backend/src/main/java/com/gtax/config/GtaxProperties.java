package com.gtax.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Strongly-typed binding of the {@code gtax.*} configuration tree
 * (see application.yml). Populated from environment variables in every profile.
 */
@ConfigurationProperties(prefix = "gtax")
public record GtaxProperties(
        Supabase supabase,
        Ai ai,
        Tax tax,
        Cors cors
) {
    public record Supabase(
            String url,
            String serviceRoleKey,
            String storageBucket
    ) {}

    public record Ai(
            String baseUrl,
            String internalApiKey
    ) {}

    public record Tax(
            long standardDeduction,
            int financialYearStartMonth
    ) {}

    public record Cors(
            String allowedOrigins
    ) {}
}
