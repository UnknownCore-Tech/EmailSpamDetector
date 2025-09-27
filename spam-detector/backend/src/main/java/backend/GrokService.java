package backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.List;
import java.util.Map;

@Service
public class GrokService {
    private static final Logger logger = LoggerFactory.getLogger(GrokService.class);
    
    private final WebClient webClient;
    private final String apiKey;
    
    public GrokService(@Value("${grok.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
            .baseUrl("https://api.groq.com/openai/v1")
            .defaultHeader("Authorization", "Bearer " + apiKey)
            .defaultHeader("Content-Type", "application/json")
            .build();
            
        logger.info("GroqCloud AI Service initialized");
    }
    
    public boolean isConfigured() {
        return apiKey != null && !apiKey.isEmpty() && !apiKey.equals("your-grok-api-key-here");
    }
    
    public Mono<String> analyzeEmailContent(String content) {
        logger.debug("Analyzing email content with GroqCloud AI");
        
        if (!isConfigured()) {
            return Mono.error(new RuntimeException("GroqCloud AI API key not configured"));
        }
        
        String prompt = createSpamAnalysisPrompt(content);
        
        Map<String, Object> requestBody = Map.of(
            "messages", List.of(
                Map.of("role", "system", "content", "You are an expert cybersecurity analyst specializing in email security, spam detection, phishing identification, and malware analysis. Provide detailed, actionable security assessments with high accuracy."),
                Map.of("role", "user", "content", prompt)
            ),
            "model", "llama-3.1-8b-instant",
            "stream", false,
            "temperature", 0.1,
            "max_tokens", 1000
        );
        
        return webClient.post()
            .uri("/chat/completions")
            .bodyValue(requestBody)
            .retrieve()
            .bodyToMono(Map.class)
            .timeout(Duration.ofSeconds(30))
            .map(this::extractContent)
            .doOnSuccess(result -> logger.info("GroqCloud AI analysis completed successfully"))
            .doOnError(ex -> logger.error("GroqCloud AI API error: {}", ex.getMessage()))
            .onErrorMap(ex -> new RuntimeException("GroqCloud AI analysis failed: " + ex.getMessage()));
    }
    
    private String extractContent(Map<String, Object> response) {
        try {
            List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
            if (choices != null && !choices.isEmpty()) {
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                return (String) message.get("content");
            }
            throw new RuntimeException("Invalid Grok AI response format");
        } catch (Exception e) {
            logger.error("Error parsing GroqCloud AI response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse GroqCloud AI response: " + e.getMessage());
        }
    }
    
    private String createSpamAnalysisPrompt(String content) {
        return String.format("""
            Analyze this email for security threats. Provide a CONCISE response with only key points:
            
            EMAIL CONTENT:
            %s
            
            Respond with this EXACT format (keep it short and bold):
            
            🎯 **VERDICT**: [SPAM/PHISHING/MALWARE/SUSPICIOUS/LEGITIMATE]
            📊 **CONFIDENCE**: [X%%]
            ⚠️ **THREAT LEVEL**: [LOW/MEDIUM/HIGH/CRITICAL]
            
            🚨 **KEY RISKS**:
            • [Most important risk factor]
            • [Second most important risk factor]
            • [Third risk factor if applicable]
            
            💡 **ACTION**: [One clear recommendation]
            
            Keep response under 8 lines total. Use bold formatting. Be direct and actionable.
            """, content);
    }
    
    /**
     * Fallback method for mock analysis when Grok is unavailable
     */
    public Mono<String> getMockAnalysis(String content) {
        logger.info("Using mock analysis as fallback");
        
        String mockResponse = """
            **CLASSIFICATION**: SUSPICIOUS
            **CONFIDENCE**: 75%
            **THREAT LEVEL**: MEDIUM
            **RISK FACTORS**:
            - Unable to perform real-time analysis (GroqCloud AI unavailable)
            - Content requires manual review
            **SECURITY RECOMMENDATION**: 
            - Exercise caution with this email
            - Verify sender through alternative means
            - Do not click any links until verified
            **TECHNICAL DETAILS**:
            - Analysis performed using local heuristics only
            - Full AI analysis unavailable
            """;
            
        return Mono.just(mockResponse)
            .delayElement(Duration.ofMillis(500)); // Simulate processing time
    }
}