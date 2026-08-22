package com.gtax.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.util.List;

/** FastAPI RAG deduction suggestion, grounded in tax-rule documents. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiDeductionResponse(
        String suggestedCategory,
        BigDecimal deductionAmount,
        String likelihood,
        String reason,
        List<String> sources
) {}
