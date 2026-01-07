package com.kobipast.userservice.architecture.dto;

public record IdempotencyRequest(String action, int amount) {}

