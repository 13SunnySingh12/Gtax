package com.gtax.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Pre-configured {@link RestClient} for the internal FastAPI AI service.
 * Attaches the shared internal API key on every request (TRD §10 service trust)
 * and sets sane timeouts so a slow LLM call can't hang a request thread forever.
 */
@Configuration
public class RestClientConfig {

    public static final String INTERNAL_API_KEY_HEADER = "X-Internal-Api-Key";

    /** Client for Supabase Storage REST, authenticated with the service-role key. */
    @Bean
    public RestClient supabaseRestClient(GtaxProperties props) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        factory.setReadTimeout((int) Duration.ofSeconds(30).toMillis());

        String serviceKey = props.supabase().serviceRoleKey() == null ? "" : props.supabase().serviceRoleKey();
        return RestClient.builder()
                .baseUrl(props.supabase().url() == null ? "http://localhost" : props.supabase().url())
                .defaultHeader("Authorization", "Bearer " + serviceKey)
                .defaultHeader("apikey", serviceKey)
                .requestFactory(factory)
                .build();
    }

    @Bean
    public RestClient aiRestClient(GtaxProperties props) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout((int) Duration.ofSeconds(5).toMillis());
        // Sits just above the AI service's own 40s vision budget, so its graceful
        // "failed" answer wins instead of the backend timing out first.
        factory.setReadTimeout((int) Duration.ofSeconds(45).toMillis());

        return RestClient.builder()
                .baseUrl(props.ai().baseUrl())
                .defaultHeader(INTERNAL_API_KEY_HEADER, props.ai().internalApiKey())
                .requestFactory(factory)
                .build();
    }
}
