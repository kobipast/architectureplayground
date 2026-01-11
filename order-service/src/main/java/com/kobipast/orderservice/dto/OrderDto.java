package com.kobipast.orderservice.dto;

import com.kobipast.orderservice.persistence.entity.OrderStatus;

import java.time.Instant;
import java.util.UUID;

public record OrderDto(
        UUID id,
        String userId,
        OrderStatus status,
        long amount,
        Instant createdAt,
        long version
) {}

