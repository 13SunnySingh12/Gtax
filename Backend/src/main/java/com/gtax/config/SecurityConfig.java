package com.gtax.config;

import com.gtax.security.RateLimitFilter;
import com.gtax.security.SupabaseJwtProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.web.authentication.BearerTokenAuthenticationFilter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Stateless security: every {@code /api/**} request must carry a valid Supabase
 * JWT. Supabase now signs user tokens asymmetrically (ES256, published via JWKS);
 * older projects use a symmetric HS256 shared secret. The decoder below supports
 * BOTH — JWKS first, HS256 fallback — so validation works regardless (TRD §10).
 */
@Configuration
public class SecurityConfig {

    private final GtaxProperties props;

    public SecurityConfig(GtaxProperties props) {
        this.props = props;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            // Stateless JWT-bearer API (no cookies) — CSRF does not apply; disabled intentionally.
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/info").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/health").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/api/**").authenticated()
                .anyRequest().denyAll())
            .oauth2ResourceServer(oauth -> oauth.jwt(Customizer.withDefaults()))
            // Per-user rate limiting, after JWT auth so the user id is available.
            .addFilterAfter(new RateLimitFilter(), BearerTokenAuthenticationFilter.class);
        return http.build();
    }

    /**
     * Composite decoder: try the asymmetric JWKS decoder (ES256/RS256 — Supabase's
     * current default for user tokens), then fall back to the HS256 shared-secret
     * decoder (legacy projects). Both enforce timestamp + {@code authenticated}
     * audience.
     */
    @Bean
    public JwtDecoder jwtDecoder(SupabaseJwtProperties jwtProps) {
        OAuth2TokenValidator<Jwt> validators = new DelegatingOAuth2TokenValidator<>(
                new JwtTimestampValidator(),
                new JwtClaimValidator<List<String>>(
                        "aud", aud -> aud != null && aud.contains("authenticated")));

        List<JwtDecoder> decoders = new ArrayList<>();

        // 1) Asymmetric via the project's JWKS endpoint.
        String url = props.supabase().url();
        if (url != null && !url.isBlank()) {
            String jwkSetUri = url.replaceAll("/+$", "") + "/auth/v1/.well-known/jwks.json";
            NimbusJwtDecoder jwks = NimbusJwtDecoder.withJwkSetUri(jwkSetUri)
                    .jwsAlgorithm(SignatureAlgorithm.ES256)
                    .jwsAlgorithm(SignatureAlgorithm.RS256)
                    .build();
            jwks.setJwtValidator(validators);
            decoders.add(jwks);
        }

        // 2) Symmetric HS256 via the shared JWT secret (legacy / service tokens).
        String secret = jwtProps.secret();
        if (secret != null && !secret.isBlank()) {
            SecretKeySpec key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            NimbusJwtDecoder hs = NimbusJwtDecoder.withSecretKey(key)
                    .macAlgorithm(MacAlgorithm.HS256)
                    .build();
            hs.setJwtValidator(validators);
            decoders.add(hs);
        }

        return token -> {
            JwtException last = null;
            for (JwtDecoder d : decoders) {
                try {
                    return d.decode(token);
                } catch (JwtException e) {
                    last = e;
                }
            }
            throw (last != null) ? last : new BadJwtException("No JWT decoder is configured");
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(Arrays.stream(props.cors().allowedOrigins().split(","))
                .map(String::trim).toList());
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cfg.setExposedHeaders(List.of("Location"));
        cfg.setAllowCredentials(true);
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
