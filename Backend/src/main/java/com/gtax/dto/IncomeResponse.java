package com.gtax.dto;

import com.gtax.model.Income;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record IncomeResponse(
        UUID id,
        String source,
        BigDecimal amount,
        LocalDate incomeDate,
        String notes,
        OffsetDateTime createdAt
) {
    public static IncomeResponse from(Income i) {
        return new IncomeResponse(
                i.getId(), i.getSource(), i.getAmount(),
                i.getIncomeDate(), i.getNotes(), i.getCreatedAt());
    }
}
