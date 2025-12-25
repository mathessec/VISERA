package com.visera.agentic.util;

import lombok.experimental.UtilityClass;

@UtilityClass
public class SQLValidator {

	public static void validate(String sql) {
		// Normalize: lowercase, collapse whitespace
		String q = sql
				.toLowerCase()
				.replaceAll("\\s+", " ")
				.trim();

		// ✅ Rule 1: Only allow SELECT queries
		if (!q.startsWith("select")) {
			throw new RuntimeException("Only SELECT queries are allowed");
		}

		// ❌ Rule 2: Block dangerous keywords
		if (q.contains(" insert ") ||
				q.contains(" update ") ||
				q.contains(" delete ") ||
				q.contains(" drop ") ||
				q.contains(" alter ") ||
				q.contains(" truncate ") ||
				q.contains(" create ") ||
				q.contains(" grant ") ||
				q.contains(" revoke ") ||
				q.contains(" exec ") ||
				q.contains(" execute ")) {

			throw new RuntimeException("Unsafe SQL detected and blocked");
		}

		// ✅ Rule 3: Must read ONLY from products table
		if (!q.contains(" from products")) {
			throw new RuntimeException("Query must read only from products table");
		}
	}
}


