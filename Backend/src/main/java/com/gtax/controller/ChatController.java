package com.gtax.controller;

import com.gtax.dto.ChatRequest;
import com.gtax.dto.ChatResponse;
import com.gtax.security.SecurityUtils;
import com.gtax.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService service;

    public ChatController(ChatService service) {
        this.service = service;
    }

    /** Ask the AI tax chatbot a question (RAG-grounded, TRD §7). */
    @PostMapping("/ask")
    public ChatResponse ask(@Valid @RequestBody ChatRequest req) {
        return service.ask(SecurityUtils.currentUserId(), req);
    }
}
