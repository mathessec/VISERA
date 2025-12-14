package com.visera.backend.Service;

import com.visera.backend.DTOs.ChatResponseDTO;
import com.visera.backend.Service.AgenticChatService;
import com.visera.backend.Service.TaskService;
import com.visera.backend.Service.ShipmentService;
import com.visera.backend.ai.GoogleAgentClient;

import org.springframework.stereotype.Service;

@Service
public class AgenticChatServiceImpl implements AgenticChatService {

    private final TaskService taskService;
    private final ShipmentService shipmentService;
    private final GoogleAgentClient agent;

    public AgenticChatServiceImpl(TaskService taskService,
                                  ShipmentService shipmentService,
                                  GoogleAgentClient agent) {
        this.taskService = taskService;
        this.shipmentService = shipmentService;
        this.agent = agent;
    }

    @Override
    public ChatResponseDTO chat(String question, Long workerId) {

        String intent = agent.detectIntent(question);
        String answer;

        switch (intent) {

            case "TASK_COUNT":
                answer = "You have " + taskService.countTasksByWorker(workerId) + " tasks.";
                break;

            case "TODAY_SHIPMENTS":
                answer = "You have " + shipmentService.countTodayShipments(workerId) + " shipments today.";
                break;

            case "FAILED_VERIFICATIONS":
                answer = shipmentService.countFailedVerifications(workerId)
                        + " items failed verification.";
                break;

            default:
                answer = "Sorry, I could not understand your question.";
        }

        return new ChatResponseDTO(agent.format(answer));
    }
}
