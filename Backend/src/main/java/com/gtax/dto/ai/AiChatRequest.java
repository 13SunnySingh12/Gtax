package com.gtax.dto.ai;

/** Spring Boot -> FastAPI POST /ai/chat/ask. */
public record AiChatRequest(String question) {}
