package com.gtax.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

/**
 * Hypothetical inputs for POST /api/tax/what-if. Pure calculation — never
 * persisted (TRD §9). {@code totalExpenses} is accepted for display symmetry
 * with the UI but only income and deductible expenses feed the formula.
 */
public record WhatIfRequest(
        @NotNull(message = "Total income is required")
        @DecimalMin(value = "0.0", message = "Income cannot be negative")
        BigDecimal totalIncome,

        BigDecimal totalExpenses,

        @NotNull(message = "Deductible expenses is required")
        @DecimalMin(value = "0.0", message = "Deductible expenses cannot be negative")
        BigDecimal deductibleExpenses
) {}
