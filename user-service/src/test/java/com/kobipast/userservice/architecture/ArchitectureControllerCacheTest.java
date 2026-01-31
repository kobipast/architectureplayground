package com.kobipast.userservice.architecture;

import com.kobipast.userservice.architecture.cache.CacheDemoService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ArchitectureControllerCacheTest {

    @Autowired
    CacheDemoService cacheDemoService;
    @Autowired CacheManager cacheManager;

    private Cache demoProfileCache() {
        Cache cache = cacheManager.getCache("demoProfile");
        assertNotNull(cache, "Cache 'demoProfile' must exist");
        return cache;
    }

    @BeforeEach
    void clearCache() {
        demoProfileCache().clear();
    }

    @Test
    void getProfile_isCached_byUserId() {
        String userId = "u1";

        Map<String, Object> first = cacheDemoService.getProfile(userId);
        String t1 = (String) first.get("generatedAt");
        assertNotNull(t1);

        // second call should return cached value -> same generatedAt
        Map<String, Object> second = cacheDemoService.getProfile(userId);
        String t2 = (String) second.get("generatedAt");

        assertEquals(t1, t2, "Second call should be served from cache (same generatedAt)");
        assertNotNull(demoProfileCache().get(userId), "Cache should contain entry for userId");
    }

    @Test
    void evictProfile_removesCacheEntry() {
        String userId = "u1";

        Map<String, Object> first = cacheDemoService.getProfile(userId);
        String t1 = (String) first.get("generatedAt");

        cacheDemoService.evictProfile(userId);
        assertNull(demoProfileCache().get(userId), "Cache entry should be evicted");

        Map<String, Object> afterEvict = cacheDemoService.getProfile(userId);
        String t2 = (String) afterEvict.get("generatedAt");

        assertNotEquals(t1, t2, "After eviction, generatedAt should be regenerated");
    }
}

