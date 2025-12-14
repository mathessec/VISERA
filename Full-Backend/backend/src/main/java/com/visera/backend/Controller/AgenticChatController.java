package com.visera.backend.Controller;

import com.visera.backend.DTOs.ChatRequestDTO;
import com.visera.backend.DTOs.ChatResponseDTO;
import com.visera.backend.Service.AgenticChatService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/agentic")
public class AgenticChatController {

    private final AgenticChatService chatService;

    public AgenticChatController(AgenticChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping("/chat")
    public ChatResponseDTO chat(@RequestBody ChatRequestDTO request) {
        return chatService.chat(request.getQuestion(), request.getWorkerId());
    }
}
