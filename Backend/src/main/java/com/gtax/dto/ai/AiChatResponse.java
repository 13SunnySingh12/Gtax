package com.gtax.dto.ai;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

/** FastAPI RAG chatbot answer + source rule titles. */
@JsonIgnoreProperties(ignoreUnknown = true)
public record AiChatResponse(
        String answer,
        List<String> sources
) {}
