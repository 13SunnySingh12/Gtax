package com.gtax.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;

/** FastAPI OCR result. Any field may be null when the receipt is unreadable. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiOcrResponse(
        BigDecimal amount,
        String date,      // ISO yyyy-MM-dd, may be null
        String vendor,
        String rawText,
        String status     // "done" | "failed"
) {}
