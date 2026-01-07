package com.kobipast.userservice.architecture.idempotency;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface IdempotencyRecordRepository extends JpaRepository<IdempotencyRecord, UUID> {
    Optional<IdempotencyRecord> findByIdempotencyKeyAndScope(String idempotencyKey, String scope);
    void deleteByExpiresAtBefore(java.time.Instant now);
}
