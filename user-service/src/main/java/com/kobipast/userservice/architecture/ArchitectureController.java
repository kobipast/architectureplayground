package com.kobipast.userservice.architecture;

import com.kobipast.userservice.architecture.dto.*;
import com.kobipast.userservice.architecture.idempotency.IdempotencyService;
import com.kobipast.userservice.architecture.observability.CorrelationIdFilter;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.bind.annotation.*;

        import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@EnableMethodSecurity
@RestController
@RequestMapping("/architecture")
public class ArchitectureController {

    private final IdempotencyService idempotencyService;

    public ArchitectureController(IdempotencyService idempotencyService) {
        this.idempotencyService = idempotencyService;
    }

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

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin")
    public ArchitectureResponse admin(@RequestHeader(value = CorrelationIdFilter.HEADER, required = false) String correlationId) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("message", "admin call - access successfully");
        data.put("correlationId", correlationId);
        return new ArchitectureResponse("correlation-id", Instant.now(), data);
    }

    @RateLimiter(name = "architectureRateLimiter")
    @GetMapping("/rate-limit")
    public ArchitectureResponse rateLimit() {
        return new ArchitectureResponse(
                "rate-limit",
                Instant.now(),
                Map.of("message", "ok")
        );
    }

    @PostMapping("/idempotency")
    public ResponseEntity<IdempotencyResponse> idempotency(@RequestHeader("Idempotency-Key") String key, @RequestBody IdempotencyRequest req) {
        IdempotencyResult<IdempotencyResponse> result =
                idempotencyService.execute(
                        key,
                        "POST:/architecture/idempotency",
                        req,
                        IdempotencyResponse.class,
                        () -> new IdempotencyResult<>(
                                201,
                                new IdempotencyResponse("Processed: " + req.action() + " amount=" + req.amount(), false), false)
                );

        IdempotencyResponse body = new IdempotencyResponse(result.body().message(), result.replay());

        return ResponseEntity.status(result.statusCode()).body(body);
    }


}

