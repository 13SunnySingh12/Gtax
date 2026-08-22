package com.gtax.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/** One optional receipt per expense (EXPENSES ||--o| RECEIPTS). */
@Entity
@Table(name = "receipts")
@Getter
@Setter
@NoArgsConstructor
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "expense_id")
    private UUID expenseId;

    @Column(name = "user_id", nullable = false, updatable = false)
    private UUID userId;

    @Column(name = "file_url", nullable = false)
    private String fileUrl;

    @Column(name = "ocr_raw_text")
    private String ocrRawText;

    /** One of: pending | processing | done | failed (see {@link OcrStatus}). */
    @Column(name = "ocr_status", nullable = false)
    private String ocrStatus = OcrStatus.PENDING.dbValue();

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
