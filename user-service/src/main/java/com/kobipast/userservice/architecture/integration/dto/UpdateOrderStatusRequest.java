package com.kobipast.userservice.architecture.integration.dto;

public record UpdateOrderStatusRequest(String status, long version) {}
