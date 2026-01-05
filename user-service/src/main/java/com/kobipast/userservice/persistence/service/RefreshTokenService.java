package com.kobipast.userservice.persistence.service;

import com.kobipast.userservice.persistence.entity.RefreshToken;
import com.kobipast.userservice.persistence.entity.User;
import com.kobipast.userservice.persistence.repository.RefreshTokenRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Transactional
@Service
public class RefreshTokenService {

    private final RefreshTokenRepository repo;

    public RefreshTokenService(RefreshTokenRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public RefreshToken create(User user) {
        RefreshToken rt = repo.findByUser(user)
                .orElseGet(() -> {
                    RefreshToken x = new RefreshToken();
                    x.setUser(user);
                    return x;
                });

        rt.setToken(UUID.randomUUID().toString());
        rt.setExpiresAt(Instant.now().plus(7, ChronoUnit.DAYS));
        return repo.save(rt);
    }

    public RefreshToken verify(String token) {
        RefreshToken rt = repo.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid refresh token"));

        if (rt.getExpiresAt().isBefore(Instant.now())) {
            repo.delete(rt);
            throw new RuntimeException("Refresh token expired");
        }
        return rt;
    }

    public void deleteByToken(String token) {
        repo.findByToken(token).ifPresent(repo::delete);
    }
}
