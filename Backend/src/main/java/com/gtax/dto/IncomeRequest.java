package com.gtax.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Body for POST/PUT /api/incomes. */
public record IncomeRequest(
        @NotBlank(message = "Source is required")
        String source,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Amount cannot be negative")
        @Digits(integer = 12, fraction = 2, message = "Amount has too many digits")
        BigDecimal amount,

        @NotNull(message = "Date is required")
        @PastOrPresent(message = "Income date cannot be in the future")
        LocalDate incomeDate,

        @Size(max = 2000, message = "Notes are too long")
        String notes
) {}
