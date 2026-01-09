package com.kobipast.orderservice.dto;

import com.kobipast.orderservice.persistence.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusRequest(
        @NotNull OrderStatus status,
        long version
) {}
