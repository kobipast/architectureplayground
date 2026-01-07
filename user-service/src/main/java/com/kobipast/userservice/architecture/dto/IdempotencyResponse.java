package com.kobipast.userservice.architecture.dto;

public record IdempotencyResponse(String message, boolean replay) {}

