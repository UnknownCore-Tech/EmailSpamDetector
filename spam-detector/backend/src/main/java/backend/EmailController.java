package backend;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class EmailController {
    private final KimiService ai;

    public EmailController(KimiService ai) {
        this.ai = ai;
    }

    @PostMapping(value = "/spam-check", consumes = MediaType.TEXT_PLAIN_VALUE)
    public Mono<SpamVerdict> check(@RequestBody String emlSource) {
        String prompt = """
            Analyse the following raw email and return only:
            1) SPAM or HAM
            2) Main attack category (if any)
            3) One-line verdict
            4) Why you think so (short explanation)
            5) Confidence percentage (0-100%)
            \nRaw email:\n%s
            """.formatted(emlSource);

        return ai.ask(prompt)
                 .map(answer -> new SpamVerdict(answer.trim()))
                 .onErrorResume(e -> Mono.just(new SpamVerdict("Service unavailable")));
    }

    public record SpamVerdict(String result) {}
} 