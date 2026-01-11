package com.kobipast.userservice.architecture.integration.dto;

public record OrderDto(
        String id,
        String userId,
        String status,
        long amount,
        String createdAt,
        long version
) {}
