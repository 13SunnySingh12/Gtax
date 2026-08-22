package com.gtax.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "expenses")
@Getter
@Setter
@NoArgsConstructor
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "amount", nullable = false, precision = 14, scale = 2)
    private BigDecimal amount;

    @Column(name = "vendor")
    private String vendor;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    /** User-confirmed category. */
    @Column(name = "category")
    private String category;

    /** AI proposal; the row's badge stays "AI suggested" until the user confirms. */
    @Column(name = "ai_suggested_category")
    private String aiSuggestedCategory;

    @Column(name = "is_deductible", nullable = false)
    private boolean deductible = false;

    @Column(name = "deduction_reason")
    private String deductionReason;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
