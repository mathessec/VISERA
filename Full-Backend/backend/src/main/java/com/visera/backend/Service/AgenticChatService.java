package com.visera.backend.Service;

import com.visera.backend.DTOs.ChatResponseDTO;

public interface AgenticChatService {
    ChatResponseDTO chat(String question, Long workerId);
}
