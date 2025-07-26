package backend;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/spam")
@CrossOrigin(origins = "http://localhost:3000")
public class SpamController {

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public void receiveSpamData(@RequestBody Map<String, Object> payload) {
        System.out.println("Received spam form data:");
        System.out.println("Email: " + payload.get("email"));
        System.out.println("URLs: " + payload.get("urls"));
        System.out.println("emlFile: " + payload.get("emlFile"));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void receiveSpamDataWithFile(
            @RequestParam("email") String email,
            @RequestParam("urls") String urls,
            @RequestParam(value = "emlFile", required = false) MultipartFile emlFile
    ) throws IOException {
        System.out.println("Received spam form data (with file):");
        System.out.println("Email: " + email);
        System.out.println("URLs: " + urls);
        if (emlFile != null && !emlFile.isEmpty()) {
            String emlContent = new String(emlFile.getBytes());
            System.out.println("emlFile content:\n" + emlContent);
        } else {
            System.out.println("No emlFile uploaded.");
        }
    }
} 