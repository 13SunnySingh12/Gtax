package com.gtax.dto.ai;

import java.math.BigDecimal;

/** Spring Boot -> FastAPI POST /ai/expenses/categorize. */
public record AiCategorizeRequest(
        String text,
        String vendor,
        BigDecimal amount
) {}
