package com.kobipast.userservice.architecture.cache;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class CacheDemoService {

    private static final Logger log = LoggerFactory.getLogger(CacheDemoService.class);

    @Cacheable(cacheNames = "demoProfile", key = "#userId")
    public Map<String, Object> getProfile(String userId) {
        // simulate expensive work
        log.info("CacheDemoService.getProfile executed for userId={}", userId);
        try {
            Thread.sleep(800);
        } catch (InterruptedException ignored) {

        }

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("userId", userId);
        data.put("generatedAt", Instant.now().toString());
        data.put("cached", false);
        return data;
    }

    @CacheEvict(cacheNames = "demoProfile", key = "#userId")
    public void evictProfile(String userId) {
        log.info("CacheDemoService.evictProfile invalidate cache for userId={}", userId);
    }
}
