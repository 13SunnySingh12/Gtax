package com.gtax.service;

import com.gtax.dto.ChatRequest;
import com.gtax.dto.ChatResponse;
import com.gtax.dto.ai.AiChatRequest;
import com.gtax.dto.ai.AiChatResponse;
import com.gtax.model.ChatMessage;
import com.gtax.repository.ChatMessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

/**
 * RAG chatbot orchestration (TRD §7). Forwards the question to FastAPI, persists
 * the Q&A pair, and returns the grounded answer with its source rule titles.
 */
@Service
public class ChatService {

    private final FastApiClientService aiClient;
    private final ChatMessageRepository chatRepository;

    public ChatService(FastApiClientService aiClient, ChatMessageRepository chatRepository) {
        this.aiClient = aiClient;
        this.chatRepository = chatRepository;
    }

    @Transactional
    public ChatResponse ask(UUID userId, ChatRequest req) {
        AiChatResponse ai = aiClient.ask(new AiChatRequest(req.question()));

        ChatMessage msg = new ChatMessage();
        msg.setUserId(userId);
        msg.setQuestion(req.question());
        msg.setAnswer(ai.answer());
        ChatMessage saved = chatRepository.save(msg);

        return new ChatResponse(
                saved.getId(),
                saved.getQuestion(),
                saved.getAnswer(),
                ai.sources() == null ? List.of() : ai.sources(),
                saved.getCreatedAt());
    }
}
