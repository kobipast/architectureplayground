package com.kobipast.userservice.architecture.idempotency;


import com.kobipast.userservice.architecture.dto.IdempotencyResult;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class IdempotencyService {

    private static final Duration TTL = Duration.ofMinutes(10);

    private final IdempotencyRecordRepository repo;
    private final ObjectMapper objectMapper;

    public IdempotencyService(IdempotencyRecordRepository repo, ObjectMapper objectMapper) {
        this.repo = repo;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public <T> IdempotencyResult<T> execute(
            String idempotencyKey,
            String scope,
            Object requestBody,
            Class<T> responseType,
            java.util.function.Supplier<IdempotencyResult<T>> action
    ) {
        cleanupExpired();

        String requestHash = sha256Json(requestBody);

        Optional<IdempotencyRecord> existingOpt = repo.findByIdempotencyKeyAndScope(idempotencyKey, scope);
        if (existingOpt.isPresent()) {
            IdempotencyRecord existing = existingOpt.get();

            if (existing.getExpiresAt().isBefore(Instant.now())) {
                repo.delete(existing);
            } else if (!existing.getRequestHash().equals(requestHash)) {
                throw new IdempotencyConflictException("Idempotency-Key reused with a different request body.");
            } else {
                // Return cached response
                T body = readJson(existing.getResponseBodyJson(), responseType);
                return new IdempotencyResult<>(existing.getStatusCode(), body, true);
            }
        }

        // Execute business action once
        IdempotencyResult<T> result = action.get();

        // Persist response
        IdempotencyRecord rec = new IdempotencyRecord();
        rec.setIdempotencyKey(idempotencyKey);
        rec.setScope(scope);
        rec.setRequestHash(requestHash);
        rec.setStatusCode(result.statusCode());
        rec.setResponseBodyJson(writeJson(result.body()));
        rec.setCreatedAt(Instant.now());
        rec.setExpiresAt(Instant.now().plus(TTL));
        repo.save(rec);

        return new IdempotencyResult<>(result.statusCode(), result.body(), false);
    }

    private void cleanupExpired() {
        repo.deleteByExpiresAtBefore(Instant.now());
    }

    private String sha256Json(Object obj) {
        try {
            byte[] json = objectMapper.writeValueAsBytes(obj);
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] digest = md.digest(json);
            return HexFormat.of().formatHex(digest);
        } catch (Exception e) {
            throw new RuntimeException("Failed to hash request body", e);
        }
    }

    private String writeJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            throw new RuntimeException("Failed to serialize response", e);
        }
    }

    private <T> T readJson(String json, Class<T> type) {
        try {
            return objectMapper.readValue(json, type);
        } catch (Exception e) {
            throw new RuntimeException("Failed to deserialize cached response", e);
        }
    }
}
