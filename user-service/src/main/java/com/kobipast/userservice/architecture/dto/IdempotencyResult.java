package com.kobipast.userservice.architecture.dto;

public record IdempotencyResult<T>(int statusCode, T body, boolean replay) {}
