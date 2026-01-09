package com.kobipast.orderservice.api;

import com.kobipast.orderservice.dto.CreateOrderRequest;
import com.kobipast.orderservice.dto.OrderDto;
import com.kobipast.orderservice.dto.UpdateOrderStatusRequest;
import com.kobipast.orderservice.mapper.OrderMapper;
import com.kobipast.orderservice.persistence.entity.Order;
import com.kobipast.orderservice.persistence.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;
    private final OrderMapper mapper;

    public OrderController(OrderService service, OrderMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    @PostMapping
    public ResponseEntity<OrderDto> create(@Valid @RequestBody CreateOrderRequest req) {
        Order created = service.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(mapper.toDto(created));
    }

    @GetMapping("/{id}")
    public OrderDto get(@PathVariable UUID id) {
        return mapper.toDto(service.get(id));
    }

    @PatchMapping("/{id}/status")
    public OrderDto updateStatus(@PathVariable UUID id, @Valid @RequestBody UpdateOrderStatusRequest req) {
        return mapper.toDto(service.updateStatus(id, req));
    }
}
