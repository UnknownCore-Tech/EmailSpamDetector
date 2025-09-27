package backend;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class KimiService {
    private static final Logger logger = LoggerFactory.getLogger(KimiService.class);
    
    private final GrokService grokService;

    public KimiService(GrokService grokService) {
        this.grokService = grokService;
        logger.info("AI Service initialized with Grok AI");
    }

    public Mono<String> ask(String userPrompt) {
        logger.debug("Processing AI request with Grok AI");
        
        return grokService.analyzeEmailContent(userPrompt)
                .onErrorResume(ex -> {
                    logger.warn("Grok AI failed, using fallback: {}", ex.getMessage());
                    return grokService.getMockAnalysis(userPrompt);
                });
    }
}
