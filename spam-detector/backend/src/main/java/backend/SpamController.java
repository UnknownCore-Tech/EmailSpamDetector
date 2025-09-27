package backend;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/spam")
@CrossOrigin(origins = {"${app.frontend.url:http://localhost:3000}", "https://*.vercel.app", "https://*.netlify.app", "https://*.herokuapp.com"})
public class SpamController {

    private final KimiService kimiService;

    public SpamController(KimiService kimiService) {
        this.kimiService = kimiService;
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Map<String, Object>>> receiveSpamData(@RequestBody Map<String, Object> payload) {
        String emailText = (String) payload.get("email");
        String urls = (String) payload.get("urls");
        String emlFile = payload.get("emlFile") != null ? payload.get("emlFile").toString() : "";
        
        StringBuilder sb = new StringBuilder();
        if (emailText != null && !emailText.trim().isEmpty()) {
            sb.append("Email Content: ").append(emailText).append("\n\n");
        }
        if (urls != null && !urls.trim().isEmpty()) {
            sb.append("URLs to analyze: ").append(urls).append("\n\n");
        }
        if (!emlFile.isEmpty()) {
            String processedEml = processEmlContent(emlFile);
            sb.append("EML File Analysis: ").append(processedEml).append("\n\n");
        }
        
        String content = sb.toString().trim();
        if (content.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "No content provided for analysis")));
        }
        
        return kimiService.ask(content)
                .map(verdict -> ResponseEntity.ok(Map.of("verdict", (Object) verdict)))
                .onErrorResume(e -> {
                    System.err.println("AI Analysis Error: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(500).body(Map.of("error", "AI service unavailable: " + e.getMessage())));
                });
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<Map<String, Object>>> receiveSpamDataWithFile(
            @RequestParam(value = "email", required = false, defaultValue = "") String email,
            @RequestParam(value = "urls", required = false, defaultValue = "") String urls,
            @RequestParam(value = "emlFile", required = false) MultipartFile emlFile
    ) throws IOException {
        StringBuilder sb = new StringBuilder();
        
        if (email != null && !email.trim().isEmpty()) {
            sb.append("Email Content: ").append(email).append("\n\n");
        }
        if (urls != null && !urls.trim().isEmpty()) {
            sb.append("URLs to analyze: ").append(urls).append("\n\n");
        }
        if (emlFile != null && !emlFile.isEmpty()) {
            // Check file size (limit to 5MB)
            if (emlFile.getSize() > 5 * 1024 * 1024) {
                return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "EML file too large. Maximum size: 5MB")));
            }
            
            String emlContent = new String(emlFile.getBytes());
            String processedContent = processEmlContent(emlContent);
            sb.append("EML File Analysis: ").append(processedContent).append("\n\n");
        }
        
        String content = sb.toString().trim();
        if (content.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "No content provided for analysis")));
        }
        
        System.out.println("Analyzing content: " + content.substring(0, Math.min(100, content.length())) + "...");
        
        return kimiService.ask(content)
                .map(verdict -> ResponseEntity.ok(Map.of("verdict", (Object) verdict)))
                .onErrorResume(e -> {
                    System.err.println("File upload AI Analysis Error: " + e.getMessage());
                    return Mono.just(ResponseEntity.status(500).body(Map.of("error", "AI service unavailable: " + e.getMessage())));
                });
    }
    
    /**
     * Process EML content to extract key information and reduce payload size
     */
    private String processEmlContent(String emlContent) {
        if (emlContent == null || emlContent.trim().isEmpty()) {
            return "Empty EML file";
        }
        
        // Limit total content size
        int maxLength = 3000; // Reasonable limit for API
        StringBuilder processed = new StringBuilder();
        
        String[] lines = emlContent.split("\n");
        boolean inHeaders = true;
        boolean inBody = false;
        int bodyLines = 0;
        
        // Extract key headers and body content
        for (String line : lines) {
            if (processed.length() > maxLength) break;
            
            if (inHeaders) {
                // Extract important headers only
                if (line.toLowerCase().startsWith("from:") ||
                    line.toLowerCase().startsWith("to:") ||
                    line.toLowerCase().startsWith("subject:") ||
                    line.toLowerCase().startsWith("date:") ||
                    line.toLowerCase().startsWith("reply-to:") ||
                    line.toLowerCase().startsWith("return-path:")) {
                    processed.append(line).append("\n");
                }
                
                // Detect end of headers
                if (line.trim().isEmpty()) {
                    inHeaders = false;
                    inBody = true;
                    processed.append("\n--- EMAIL BODY ---\n");
                }
            } else if (inBody && bodyLines < 50) { // Limit body to 50 lines
                // Skip very long lines that might be encoded content
                if (line.length() < 200) {
                    processed.append(line).append("\n");
                    bodyLines++;
                }
            }
        }
        
        // Add file metadata
        String metadata = String.format("\n--- EML METADATA ---\n" +
            "Original size: %d bytes\n" +
            "Processed size: %d characters\n" +
            "Total lines: %d\n",
            emlContent.length(), processed.length(), lines.length);
        
        processed.append(metadata);
        
        return processed.toString();
    }
}
