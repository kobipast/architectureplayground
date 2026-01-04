package com.kobipast.userservice.architecture.dto;

import java.time.Instant;
import java.util.Map;

public record ArchitectureResponse(
        String mechanism,
        Instant timestamp,
        Map<String, Object> data
) {}
