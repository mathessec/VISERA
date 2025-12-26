# Agentic AI Service for Products

This is a Spring Boot application that uses **real Gemini AI** to convert natural language questions about products into SQL queries and return human-readable answers.

## Features

- **Real AI Integration**: Uses Google Gemini 1.5 Flash API (not pattern matching)
- **Natural Language Queries**: Ask questions in plain English about products
- **SQL Security**: Validates all generated SQL to prevent injection attacks
- **Read-Only Access**: Only SELECT queries allowed, no data modifications
- **Product-Focused**: Currently supports queries about the products table

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- MySQL database (visera_db) running on localhost:3306
- Gemini API key (configured in application.properties)

## Setup

1. **Database**: Ensure MySQL is running and `visera_db` database exists with a `products` table

2. **Configuration**: Update `src/main/resources/application.properties` if needed:
   - Database credentials (default: root/root1234)
   - Server port (default: 8082)
   - Gemini API key is already configured

3. **Build and Run**:
   ```bash
   cd BACKEND/agentic-ai
   mvn clean install
   mvn spring-boot:run
   ```

4. **Verify**: Check logs for "Agentic AI Application Started on port 8082"

## API Endpoint

### POST `/api/ai/products/chat`

Ask natural language questions about products.

**Request:**
```json
{
  "question": "how many active products are there?"
}
```

**Response:**
```
"There are 5 products matching your request."
```

## Testing with Postman

1. **Import Collection**: Import `POSTMAN_COLLECTION.json` into Postman

2. **Test Cases Available**:
   - Count Active Products
   - List All Products
   - Count by Category
   - List Inactive Products
   - Search by Product Code
   - Count by Multiple Criteria
   - Natural Language Variations
   - Error Handling Tests

3. **Base URL**: `http://localhost:8082`

## Example Questions

- "how many active products are there?"
- "show me all products"
- "list all inactive products"
- "how many products are in the Electronics category?"
- "find product with code PROD001"
- "what's the total number of products that are currently active?"

## Architecture

```
Client Request → ProductAIController → ProductAIService → GeminiClient → Gemini API
                                                              ↓
                                                         SQLValidator
                                                              ↓
                                                         JdbcTemplate → MySQL Database
```

## Security Features

- ✅ Only SELECT queries allowed
- ✅ Blocks dangerous SQL keywords (INSERT, UPDATE, DELETE, DROP, etc.)
- ✅ Restricts queries to `products` table only
- ✅ Read-only database access

## Project Structure

```
BACKEND/agentic-ai/
├── pom.xml
├── POSTMAN_COLLECTION.json
├── README.md
└── src/
    ├── main/
    │   ├── java/com/visera/agentic/
    │   │   ├── AgenticAIApplication.java
    │   │   ├── controller/
    │   │   │   └── ProductAIController.java
    │   │   ├── service/
    │   │   │   └── ProductAIService.java
    │   │   ├── client/
    │   │   │   └── GeminiClient.java
    │   │   ├── util/
    │   │   │   └── SQLValidator.java
    │   │   └── config/
    │   │       ├── RestTemplateConfig.java
    │   │       └── DatabaseConfig.java
    │   └── resources/
    │       └── application.properties
    └── test/
        └── java/com/visera/agentic/
            └── AgenticAIApplicationTests.java
```

## Troubleshooting

1. **Application won't start**: Check MySQL is running and database exists
2. **API errors**: Verify Gemini API key is valid in application.properties
3. **SQL errors**: Check database connection and table schema
4. **No response**: Check application logs for detailed error messages

## Next Steps

Once this works perfectly for products, we can extend it to other entities (shipments, inventory, etc.)






