package com.gtax.model;

/** Lifecycle of the OCR pass on a receipt (matches the DB check constraint). */
public enum OcrStatus {
    PENDING("pending"),
    PROCESSING("processing"),
    DONE("done"),
    FAILED("failed");

    private final String dbValue;

    OcrStatus(String dbValue) {
        this.dbValue = dbValue;
    }

    public String dbValue() {
        return dbValue;
    }
}
