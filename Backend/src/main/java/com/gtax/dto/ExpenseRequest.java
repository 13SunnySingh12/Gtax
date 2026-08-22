package com.gtax.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Body for POST/PUT /api/expenses (also used to save a receipt-derived expense). */
public record ExpenseRequest(
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Amount cannot be negative")
        @Digits(integer = 12, fraction = 2, message = "Amount has too many digits")
        BigDecimal amount,

        @Size(max = 255, message = "Vendor is too long")
        String vendor,

        @NotNull(message = "Date is required")
        @PastOrPresent(message = "Expense date cannot be in the future")
        LocalDate expenseDate,

        @Size(max = 100, message = "Category is too long")
        String category,

        Boolean isDeductible,

        @Size(max = 2000, message = "Deduction reason is too long")
        String deductionReason
) {}
