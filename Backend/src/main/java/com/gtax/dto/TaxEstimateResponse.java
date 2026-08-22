package com.gtax.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * Result of the slab-based tax calculation (TRD §9). Used by both
 * GET /api/tax/estimate and POST /api/tax/what-if.
 */
public record TaxEstimateResponse(
        BigDecimal totalIncome,
        BigDecimal deductibleExpenses,
        BigDecimal standardDeduction,
        BigDecimal taxableIncome,
        BigDecimal estimatedTax,
        String financialYearLabel,
        List<SlabBreakdown> breakdown
) {}
