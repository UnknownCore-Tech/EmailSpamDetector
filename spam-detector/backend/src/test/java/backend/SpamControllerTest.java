package backend;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SpamController.class)
class SpamControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testReceiveSpamData_WithValidJsonPayload() throws Exception {
        // Given
        Map<String, Object> payload = new HashMap<>();
        payload.put("email", "test@example.com");
        payload.put("urls", "https://example.com,https://test.com");
        payload.put("emlFile", "sample email content");

        String jsonPayload = objectMapper.writeValueAsString(payload);

        // When & Then
        mockMvc.perform(post("/api/spam")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk());
    }

    @Test
    void testReceiveSpamData_WithEmptyPayload() throws Exception {
        // Given
        Map<String, Object> payload = new HashMap<>();
        String jsonPayload = objectMapper.writeValueAsString(payload);

        // When & Then
        mockMvc.perform(post("/api/spam")
                .contentType(MediaType.APPLICATION_JSON)
                .content(jsonPayload))
                .andExpect(status().isOk());
    }

    @Test
    void testReceiveSpamDataWithFile_WithAllParameters() throws Exception {
        // Given
        MockMultipartFile emlFile = new MockMultipartFile(
                "emlFile", 
                "test.eml", 
                "message/rfc822", 
                "From: sender@example.com\nTo: recipient@example.com\nSubject: Test Email\n\nThis is a test email.".getBytes()
        );

        // When & Then
        mockMvc.perform(multipart("/api/spam/upload")
                .file(emlFile)
                .param("email", "test@example.com")
                .param("urls", "https://example.com,https://test.com"))
                .andExpect(status().isOk());
    }

    @Test
    void testReceiveSpamDataWithFile_WithoutEmlFile() throws Exception {
        // When & Then
        mockMvc.perform(multipart("/api/spam/upload")
                .param("email", "test@example.com")
                .param("urls", "https://example.com"))
                .andExpect(status().isOk());
    }

    @Test
    void testReceiveSpamData_WithInvalidContentType() throws Exception {
        // Given
        String payload = "invalid json content";

        // When & Then
        mockMvc.perform(post("/api/spam")
                .contentType(MediaType.TEXT_PLAIN)
                .content(payload))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void testReceiveSpamData_WithInvalidJson() throws Exception {
        // Given
        String invalidJson = "{ invalid json }";

        // When & Then
        mockMvc.perform(post("/api/spam")
                .contentType(MediaType.APPLICATION_JSON)
                .content(invalidJson))
                .andExpect(status().isBadRequest());
    }
} 