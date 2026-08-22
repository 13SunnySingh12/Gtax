package com.gtax.dto.ai;

import java.math.BigDecimal;

/** Spring Boot -> FastAPI POST /ai/deductions/suggest. */
public record AiDeductionRequest(
        String vendor,
        BigDecimal amount,
        String category,
        String description
) {}
