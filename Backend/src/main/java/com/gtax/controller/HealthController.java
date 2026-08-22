package com.gtax.controller;

import com.gtax.service.FastApiClientService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Public composite health probe consumed by the frontend bootstrap flow. Reports
 * only up/down booleans (no secrets, no internals):
 *   - database: a trivial {@code SELECT 1}
 *   - ai:       the FastAPI service liveness
 * Overall: DOWN if the DB is down (503), DEGRADED if only AI is down (still 200 —
 * AI is non-blocking per PRD), otherwise UP.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final JdbcTemplate jdbcTemplate;
    private final FastApiClientService aiClient;

    public HealthController(JdbcTemplate jdbcTemplate, FastApiClientService aiClient) {
        this.jdbcTemplate = jdbcTemplate;
        this.aiClient = aiClient;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        boolean db = checkDatabase();
        boolean ai = aiClient.isAiHealthy();
        String status = !db ? "DOWN" : (ai ? "UP" : "DEGRADED");

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("status", status);
        body.put("database", db ? "UP" : "DOWN");
        body.put("ai", ai ? "UP" : "DOWN");
        body.put("time", Instant.now().toString());

        return ResponseEntity.status(db ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE).body(body);
    }

    private boolean checkDatabase() {
        try {
            Integer one = jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return one != null && one == 1;
        } catch (Exception e) {
            return false;
        }
    }
}
