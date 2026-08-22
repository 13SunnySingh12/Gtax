package com.gtax.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body for POST /api/chat/ask. */
public record ChatRequest(
        @NotBlank(message = "Question is required")
        @Size(max = 2000, message = "Question is too long")
        String question
) {}
