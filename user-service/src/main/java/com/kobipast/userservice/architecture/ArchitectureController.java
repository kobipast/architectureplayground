package com.kobipast.userservice.architecture;

import com.kobipast.userservice.architecture.dto.ArchitectureResponse;
import com.kobipast.userservice.architecture.dto.ValidationRequest;
import com.kobipast.userservice.architecture.observability.CorrelationIdFilter;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

        import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/architecture")
public class ArchitectureController {

    @GetMapping("/trace")
    public ArchitectureResponse trace(@RequestHeader(value = CorrelationIdFilter.HEADER, required = false) String correlationId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("message", "trace OK");
        data.put("correlationId", correlationId);
        return new ArchitectureResponse("correlation-id", Instant.now(), data);
    }

    @PostMapping("/validation")
    public ArchitectureResponse validation(@Valid @RequestBody ValidationRequest req) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("receivedName", req.name());
        data.put("receivedEmail", req.email());
        return new ArchitectureResponse("problem-details-validation", Instant.now(), data);
    }
}

