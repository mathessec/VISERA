package com.visera.agentic.service;

import com.visera.agentic.client.GeminiClient;
import com.visera.agentic.util.SQLValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductAIService {

	private final JdbcTemplate jdbcTemplate;
	private final GeminiClient geminiClient;

	public Object askProductQuestion(String question) {
		try {
			// Step 1: Generate SQL from natural language using Gemini AI
			String sql = geminiClient.generateProductSQL(question);
			log.info("Generated SQL: {}", sql);

			// Step 2: Validate SQL for security
			SQLValidator.validate(sql);
			log.info("SQL validation passed");

			// Step 3: Execute query based on type
			if (sql.toLowerCase().contains("count")) {
				// COUNT query handling
				Integer count = jdbcTemplate.queryForObject(sql, Integer.class);
				return "There are " + count + " products matching your request.";
			}

			// LIST query handling
			List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);

			if (rows.isEmpty()) {
				return "No products found.";
			}

			// Step 4: Format response as natural language
			StringBuilder response = new StringBuilder();

			for (Map<String, Object> row : rows) {
				// Extract fields using aliases from SQL
				Object productCode = row.get("productCode");
				Object name = row.get("name");
				Object status = row.get("status");
				Object category = row.get("category");

				if (productCode != null) {
					response.append("Product ").append(productCode);
				} else if (name != null) {
					response.append("Product ").append(name);
				} else {
					response.append("Product");
				}

				if (status != null) {
					response.append(" is ").append(status);
				}

				if (category != null) {
					response.append(" in category ").append(category);
				}

				response.append(".\n");
			}

			return response.toString().trim();

		} catch (RuntimeException e) {
			log.error("Error processing question: {}", e.getMessage());
			return "Error: " + e.getMessage();
		} catch (Exception e) {
			log.error("Unexpected error: {}", e.getMessage(), e);
			return "Error processing your question. Please try again.";
		}
	}
}


