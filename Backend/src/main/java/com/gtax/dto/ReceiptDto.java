package com.gtax.dto;

import com.gtax.model.Receipt;

import java.util.UUID;

/** Receipt summary nested inside an expense response (frontend §8.4). */
public record ReceiptDto(
        UUID id,
        String fileUrl,
        String ocrStatus,
        String ocrRawText
) {
    public static ReceiptDto from(Receipt r) {
        if (r == null) return null;
        return new ReceiptDto(r.getId(), r.getFileUrl(), r.getOcrStatus(), r.getOcrRawText());
    }
}
