package com.kobipast.orderservice.mapper;

import com.kobipast.orderservice.dto.OrderDto;
import com.kobipast.orderservice.persistence.entity.Order;
import org.springframework.stereotype.Component;

@Component
public class OrderMapper {
    public OrderDto toDto(Order o) {
        return new OrderDto(
                o.getId(),
                o.getUserId(),
                o.getStatus(),
                o.getAmount(),
                o.getCreatedAt(),
                o.getVersion()
        );
    }
}