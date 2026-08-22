package com.gtax.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/** RAG-grounded chatbot answer with its source rule titles (TRD §7). */
public record ChatResponse(
        UUID id,
        String question,
        String answer,
        List<String> sources,
        OffsetDateTime createdAt
) {}
