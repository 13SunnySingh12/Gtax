package com.gtax.dto;

import com.gtax.model.Expense;
import com.gtax.model.Receipt;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ExpenseResponse(
        UUID id,
        BigDecimal amount,
        String vendor,
        LocalDate expenseDate,
        String category,
        String aiSuggestedCategory,
        boolean isDeductible,
        String deductionReason,
        OffsetDateTime createdAt,
        ReceiptDto receipt
) {
    public static ExpenseResponse from(Expense e, Receipt receipt) {
        return new ExpenseResponse(
                e.getId(), e.getAmount(), e.getVendor(), e.getExpenseDate(),
                e.getCategory(), e.getAiSuggestedCategory(), e.isDeductible(),
                e.getDeductionReason(), e.getCreatedAt(), ReceiptDto.from(receipt));
    }

    public static ExpenseResponse from(Expense e) {
        return from(e, null);
    }
}
