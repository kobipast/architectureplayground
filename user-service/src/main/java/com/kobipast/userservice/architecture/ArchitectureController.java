package com.kobipast.userservice.architecture;

import com.kobipast.userservice.architecture.cache.CacheDemoService;
import com.kobipast.userservice.architecture.dto.*;
import com.kobipast.userservice.architecture.idempotency.IdempotencyService;
import com.kobipast.userservice.architecture.integration.OrderClient;
import com.kobipast.userservice.architecture.integration.dto.CreateOrderRequest;
import com.kobipast.userservice.architecture.integration.dto.OrderDto;
import com.kobipast.userservice.architecture.integration.dto.UpdateOrderStatusRequest;
import com.kobipast.userservice.architecture.observability.CorrelationIdFilter;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

        import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@EnableMethodSecurity
@RestController
@RequestMapping("/architecture")
public class ArchitectureController {

    private final IdempotencyService idempotencyService;

    private final CacheDemoService cacheDemoService;

    private final OrderClient orderClient;

    public ArchitectureController(IdempotencyService idempotencyService, CacheDemoService cacheDemoService, OrderClient orderClient) {
        this.idempotencyService = idempotencyService;
        this.cacheDemoService = cacheDemoService;
        this.orderClient = orderClient;
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

    @GetMapping("/cache/profile")
    public ArchitectureResponse cacheProfile(@RequestParam String userId) {
        Map<String, Object> data = cacheDemoService.getProfile(userId);

        // if it came from cache, our method wasn't executed, so "cached" will still be false.
        // We’ll override it here based on a simple heuristic: presence of "generatedAt" is not enough.
        // Better: return a wrapper with a flag from service layer, but keep it simple:
        return new ArchitectureResponse("caching", Instant.now(), data);
    }

    @PostMapping("/cache/evict")
    public ArchitectureResponse cacheEvict(@RequestParam String userId) {
        cacheDemoService.evictProfile(userId);
        return new ArchitectureResponse("caching-evict", Instant.now(), Map.of("evictedUserId", userId));
    }

    @PostMapping("/orders")
    public ArchitectureResponse createOrder(@RequestBody CreateOrderRequest req) {
        String userId;
        if(StringUtils.hasLength(req.userId())){
            userId = req.userId();
        }
        userId = SecurityContextHolder.getContext().getAuthentication().getName();

        OrderDto order = orderClient.createOrder(new CreateOrderRequest(userId, req.amount()));

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("order", order);

        return new ArchitectureResponse("retry-circuit-breaker", Instant.now(), data);
    }

    @GetMapping("/orders/{id}")
    public ArchitectureResponse getOrder(@PathVariable String id) {
        OrderDto order = orderClient.getOrder(id);

        return new ArchitectureResponse("retry-circuit-breaker", Instant.now(), Map.of("order", order));
    }

    @PatchMapping("/orders/{id}/status")
    public ArchitectureResponse updateOrderStatus(@PathVariable String id, @Valid @RequestBody UpdateOrderStatusRequest req) {
        OrderDto order = orderClient.updateStatus(id, new UpdateOrderStatusRequest(req.status(), req.version()));

        return new ArchitectureResponse("optimistic-locking", Instant.now(), Map.of("order", order));
    }




}

