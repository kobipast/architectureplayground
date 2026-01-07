package com.kobipast.userservice.architecture.error;

import com.kobipast.userservice.architecture.idempotency.IdempotencyConflictException;
import com.kobipast.userservice.architecture.observability.CorrelationIdFilter;
import io.github.resilience4j.ratelimiter.RateLimiter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final RateLimiterRegistry rateLimiterRegistry;

    public GlobalExceptionHandler(RateLimiterRegistry rateLimiterRegistry) {
        this.rateLimiterRegistry = rateLimiterRegistry;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setType(URI.create("https://example.com/problems/validation"));
        pd.setTitle("Validation failed");
        pd.setDetail("One or more fields are invalid");
        pd.setInstance(URI.create(request.getRequestURI()));

        Map<String, String> errors = new LinkedHashMap<>();
        for (var err : ex.getBindingResult().getAllErrors()) {
            if (err instanceof FieldError fe) {
                errors.put(fe.getField(), fe.getDefaultMessage());
            } else {
                errors.put(err.getObjectName(), err.getDefaultMessage());
            }
        }

        pd.setProperty("errors", errors);
        pd.setProperty("correlationId", request.getHeader(CorrelationIdFilter.HEADER));
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setType(URI.create("https://example.com/problems/internal"));
        pd.setTitle("Internal Server Error");
        pd.setDetail(ex.getMessage());
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("correlationId", request.getHeader(CorrelationIdFilter.HEADER));
        return pd;
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ProblemDetail handleAccessDenied(AccessDeniedException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.FORBIDDEN);
        pd.setType(URI.create("https://example.com/problems/forbidden"));
        pd.setTitle("Forbidden");
        pd.setDetail("Access Denied");
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("correlationId",  MDC.get("correlationId"));
        return pd;
    }

    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<ProblemDetail> handleRateLimit(RequestNotPermitted ex, HttpServletRequest request) {
        RateLimiter rl = rateLimiterRegistry.rateLimiter("architectureRateLimiter");
        long seconds = Math.max(
                1,
                rl.getRateLimiterConfig().getLimitRefreshPeriod().getSeconds()
        );

        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.TOO_MANY_REQUESTS);
        pd.setType(URI.create("https://example.com/problems/rate-limit"));
        pd.setTitle("Too Many Requests");
        pd.setDetail("Rate limit exceeded. Please retry later.");
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("correlationId", MDC.get("correlationId"));

        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header(HttpHeaders.RETRY_AFTER, String.valueOf(seconds))
                .body(pd);
    }

    @ExceptionHandler(IdempotencyConflictException.class)
    public ProblemDetail handleIdempotencyConflict(IdempotencyConflictException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.CONFLICT);
        pd.setType(URI.create("https://example.com/problems/idempotency-conflict"));
        pd.setTitle("Idempotency conflict");
        pd.setDetail(ex.getMessage());
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("correlationId", MDC.get("correlationId"));
        return pd;
    }



}
