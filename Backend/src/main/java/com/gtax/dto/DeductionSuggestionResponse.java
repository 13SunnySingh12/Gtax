package com.gtax.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * AI deduction suggestion for one expense (GET /api/expenses/{id}/deduction-suggestions).
 * The AI suggests; the user decides (frontend §10.1). {@code likelihood} and
 * {@code deductionAmount} may be null when the model doesn't provide them.
 */
public record DeductionSuggestionResponse(
        java.util.UUID expenseId,
        String suggestedCategory,
        BigDecimal deductionAmount,
        String likelihood,
        String reason,
        List<String> sources
) {}
