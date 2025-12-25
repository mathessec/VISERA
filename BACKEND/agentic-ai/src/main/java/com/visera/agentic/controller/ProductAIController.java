package com.visera.agentic.controller;

import com.visera.agentic.service.ProductAIService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductAIController {

	private final ProductAIService productAIService;

	@PostMapping("/chat")
	public Object chat(@RequestBody Map<String, String> body) {
		if (body == null || !body.containsKey("question") || body.get("question") == null || body.get("question").trim().isEmpty()) {
			return Map.of("error", "Request body must contain 'question' field with a non-empty value");
		}

		String question = body.get("question").trim();
		return productAIService.askProductQuestion(question);
	}
}


