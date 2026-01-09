package com.kobipast.orderservice.persistence.service;

import com.kobipast.orderservice.dto.CreateOrderRequest;
import com.kobipast.orderservice.dto.UpdateOrderStatusRequest;
import com.kobipast.orderservice.persistence.entity.Order;
import com.kobipast.orderservice.persistence.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class OrderService {

    private final OrderRepository repo;

    public OrderService(OrderRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public Order create(CreateOrderRequest req) {
        Order o = new Order();
        o.setUserId(req.userId());
        o.setAmount(req.amount());
        return repo.save(o);
    }

    @Transactional(readOnly = true)
    public Order get(UUID id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));
    }

    @Transactional
    public Order updateStatus(UUID id, UpdateOrderStatusRequest req) {
        Order o = repo.findById(id).orElseThrow(() -> new EntityNotFoundException("Order not found: " + id));


        // Optemistic lock on code level - Optemistic lock on DB level (2 transaction on same
        // level already created by @Version
        if (req.version() != o.getVersion()) {
            throw new ObjectOptimisticLockingFailureException(Order.class, id);
        }
        // optimistic lock: client must send the version they read
        o.setVersion(req.version());
        o.setStatus(req.status());

        // saveAndFlush makes the optimistic lock failure happen here (inside this method)
        return repo.saveAndFlush(o);
    }
}
