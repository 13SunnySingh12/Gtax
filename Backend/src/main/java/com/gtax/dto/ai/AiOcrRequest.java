package com.gtax.dto.ai;

/** Spring Boot -> FastAPI POST /ai/ocr/extract. */
public record AiOcrRequest(
        String fileUrl,
        String contentType,
        /** Optional base64 of the file, so the AI service can skip re-downloading it. */
        String fileBase64
) {}
