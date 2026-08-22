package com.gtax.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/** FastAPI categorization result. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiCategorizeResponse(
        String category,
        Boolean isDeductible,
        String reason
) {}
