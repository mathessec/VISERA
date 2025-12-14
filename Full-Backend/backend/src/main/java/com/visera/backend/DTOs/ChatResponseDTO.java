package com.visera.backend.DTOs;

public class ChatResponseDTO {
    private String answer;

    public ChatResponseDTO(String answer) {
        this.answer = answer;
    }

    public String getAnswer() {
        return answer;
    }
}
