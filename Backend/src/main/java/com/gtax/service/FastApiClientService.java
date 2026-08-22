package com.gtax.service;

import com.gtax.dto.ai.*;
import com.gtax.exception.UpstreamAiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

/**
 * The single seam through which Spring Boot orchestrates every AI feature
 * (TRD §6). React never calls FastAPI directly — it always goes through here.
 * Each method forwards only what's needed and surfaces failures as
 * {@link UpstreamAiException} so callers can fall back gracefully.
 */
@Service
public class FastApiClientService {

    private static final Logger log = LoggerFactory.getLogger(FastApiClientService.class);

    private final RestClient ai;

    public FastApiClientService(RestClient aiRestClient) {
        this.ai = aiRestClient;
    }

    public AiOcrResponse extractReceipt(AiOcrRequest request) {
        return post("/ai/ocr/extract", request, AiOcrResponse.class, "OCR extraction");
    }

    public AiCategorizeResponse categorize(AiCategorizeRequest request) {
        return post("/ai/expenses/categorize", request, AiCategorizeResponse.class, "categorization");
    }

    public AiDeductionResponse suggestDeduction(AiDeductionRequest request) {
        return post("/ai/deductions/suggest", request, AiDeductionResponse.class, "deduction suggestion");
    }

    public AiChatResponse ask(AiChatRequest request) {
        return post("/ai/chat/ask", request, AiChatResponse.class, "chatbot answer");
    }

    /** Lightweight liveness probe for the AI service (used by /api/health). */
    public boolean isAiHealthy() {
        try {
            ai.get().uri("/health").retrieve().toBodilessEntity();
            return true;
        } catch (RestClientException e) {
            log.debug("AI health check failed: {}", e.getMessage());
            return false;
        }
    }

    private <T> T post(String path, Object body, Class<T> type, String label) {
        try {
            T result = ai.post()
                    .uri(path)
                    .body(body)
                    .retrieve()
                    .body(type);
            if (result == null) {
                throw new UpstreamAiException("AI service returned an empty " + label + " response");
            }
            return result;
        } catch (RestClientException e) {
            log.warn("FastAPI {} failed: {}", label, e.getMessage());
            throw new UpstreamAiException("AI service " + label + " failed", e);
        }
    }
}
