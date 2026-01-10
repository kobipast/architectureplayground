package com.kobipast.userservice.architecture.integration;

import com.kobipast.userservice.architecture.integration.dto.CreateOrderRequest;
import com.kobipast.userservice.architecture.integration.dto.OrderDto;
import com.kobipast.userservice.architecture.integration.dto.UpdateOrderStatusRequest;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Instant;

@Service
public class OrderClient {

    private final WebClient webClient;

    public OrderClient(WebClient orderWebClient) {
        this.webClient = orderWebClient;
    }

    @CircuitBreaker(name = "orders", fallbackMethod = "createFallback")
    @Retry(name = "orders")
    public OrderDto createOrder(CreateOrderRequest req) {
        return webClient.post()
                .uri("/orders")
                .bodyValue(req)
                .retrieve()
                .bodyToMono(OrderDto.class)
                .block();
    }

    private OrderDto createFallback(CreateOrderRequest req, Throwable t) {
        return new OrderDto(
                "fallback",
                req.userId(),
                "FAILED",
                req.amount(),
                Instant.now().toString(),
                -1
        );
    }

    @CircuitBreaker(name = "orders", fallbackMethod = "getFallback")
    @Retry(name = "orders")
    public OrderDto getOrder(String orderId) {
        return webClient.get()
                .uri("/orders/{id}", orderId)
                .retrieve()
                .bodyToMono(OrderDto.class)
                .block();
    }

    private OrderDto getFallback(String orderId, Throwable t) {
        return new OrderDto(orderId, "fallback", "FAILED", 0, Instant.now().toString(), -1);
    }

    @CircuitBreaker(name = "orders", fallbackMethod = "updateFallback")
    @Retry(name = "orders")
    public OrderDto updateStatus(String orderId, UpdateOrderStatusRequest req) {
        return webClient.patch()
                .uri("/orders/{id}/status", orderId)
                .bodyValue(req)
                .retrieve()
                .bodyToMono(OrderDto.class)
                .block();
    }

    private OrderDto updateFallback(String orderId, UpdateOrderStatusRequest req, Throwable t) {
        return new OrderDto(orderId, "fallback", "FAILED", 0, Instant.now().toString(), -1);
    }

}
