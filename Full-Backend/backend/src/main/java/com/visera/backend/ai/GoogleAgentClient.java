package com.visera.backend.ai;

import org.springframework.stereotype.Component;

@Component
public class GoogleAgentClient {

    private final String apiKey;

    public GoogleAgentClient() {
        this.apiKey = System.getenv("GOOGLE_AGENT_API_KEY");

        if (this.apiKey == null || this.apiKey.isEmpty()) {
            throw new RuntimeException("Google Agent API key not found");
        }
    }

    public String detectIntent(String question) {
        String q = question.toLowerCase();

        if (q.contains("task")) return "TASK_COUNT";
        if (q.contains("shipment") && q.contains("today")) return "TODAY_SHIPMENTS";
        if (q.contains("fail") || q.contains("verification")) return "FAILED_VERIFICATIONS";

        return "UNKNOWN";
    }

    public String format(String answer) {
        return answer;
    }
}
