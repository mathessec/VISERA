package com.visera.agentic.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

	private final RestTemplate restTemplate;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${gemini.api.url}")
	private String geminiApiUrl;

	@Value("${gemini.api.key}")
	private String geminiApiKey;

	public String generateProductSQL(String question) {
		try {
			// Build the prompt for Gemini
			String prompt = buildPrompt(question);

			// Prepare request headers
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_JSON);

			// Build request body
			Map<String, Object> requestBody = buildRequestBody(prompt);

			// Make API call - API key is passed as query parameter
			HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);
			String url = geminiApiUrl + "?key=" + geminiApiKey;

			log.info("Calling Gemini API: {}", url);
			log.debug("Prompt: {}", prompt);

			ResponseEntity<String> response = restTemplate.postForEntity(url, request, String.class);

			if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
				String sql = extractSQLFromResponse(response.getBody());
				log.info("Generated SQL from Gemini: {}", sql);
				return sql;
			} else {
				log.error("Gemini API returned status: {}", response.getStatusCode());
				throw new RuntimeException("Failed to generate SQL from Gemini API");
			}

		} catch (Exception e) {
			log.error("Error calling Gemini API: {}", e.getMessage(), e);
			throw new RuntimeException("Error generating SQL: " + e.getMessage(), e);
		}
	}

	private String buildPrompt(String question) {
		return """
			You are a SQL expert. Convert the following natural language question into a SQL SELECT query for the products table.
			
			Table Schema: products
			- id (BIGINT, PRIMARY KEY)
			- name (VARCHAR)
			- description (VARCHAR)
			- product_code (VARCHAR, UNIQUE)
			- category (VARCHAR)
			- status (VARCHAR) - possible values: 'Active', 'Inactive', 'LOW_STOCK'
			- image_url (VARCHAR)
			- created_at (DATETIME)
			
			Rules:
			1. Generate ONLY a SELECT query
			2. Use column aliases: product_code AS productCode, image_url AS imageUrl, created_at AS createdAt
			3. For status values, use exact case: 'Active', 'Inactive', 'LOW_STOCK'
			4. Return ONLY the SQL query, nothing else
			5. Do not include any explanations or markdown formatting
			6. Use proper SQL syntax for MySQL
			
			Question: %s
			
			SQL Query:
			""".formatted(question);
	}

	private Map<String, Object> buildRequestBody(String prompt) {
		Map<String, Object> part = new HashMap<>();
		part.put("text", prompt);

		Map<String, Object> content = new HashMap<>();
		content.put("parts", List.of(part));

		Map<String, Object> requestBody = new HashMap<>();
		requestBody.put("contents", List.of(content));

		return requestBody;
	}

	private String extractSQLFromResponse(String responseBody) {
		try {
			JsonNode rootNode = objectMapper.readTree(responseBody);
			
			// Navigate through Gemini API response structure
			JsonNode candidates = rootNode.path("candidates");
			if (candidates != null && candidates.isArray() && candidates.size() > 0) {
				JsonNode candidate = candidates.get(0);
				JsonNode content = candidate.path("content");
				JsonNode parts = content.path("parts");
				
				if (parts != null && parts.isArray() && parts.size() > 0) {
					JsonNode part = parts.get(0);
					String text = part.path("text").asText();
					
					// Clean up the SQL - remove markdown code blocks if present
					String sql = text.trim();
					if (sql.startsWith("```sql")) {
						sql = sql.substring(6);
					}
					if (sql.startsWith("```")) {
						sql = sql.substring(3);
					}
					if (sql.endsWith("```")) {
						sql = sql.substring(0, sql.length() - 3);
					}
					
					return sql.trim();
				}
			}
			
			// Fallback: try to extract from text directly
			if (responseBody.contains("SELECT") || responseBody.contains("select")) {
				// Try to find SQL in the response
				int start = responseBody.toLowerCase().indexOf("select");
				if (start != -1) {
					String sql = responseBody.substring(start);
					// Try to find the end of SQL statement
					int end = sql.indexOf(";");
					if (end != -1) {
						sql = sql.substring(0, end);
					}
					return sql.trim();
				}
			}
			
			throw new RuntimeException("Could not extract SQL from Gemini response");
			
		} catch (Exception e) {
			log.error("Error parsing Gemini response: {}", e.getMessage());
			throw new RuntimeException("Failed to parse SQL from Gemini response: " + e.getMessage(), e);
		}
	}
}

