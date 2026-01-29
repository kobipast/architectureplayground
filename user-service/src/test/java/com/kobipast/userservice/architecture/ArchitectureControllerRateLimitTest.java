package com.kobipast.userservice.architecture;

import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ArchitectureControllerRateLimitTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    RateLimiterRegistry rateLimiterRegistry;

    private int getLimitForPeriod(){
        return rateLimiterRegistry.rateLimiter("architectureRateLimiter").getRateLimiterConfig().getLimitForPeriod();
    }

    @Test
    void rateLimit_allows5Requests_thenRejects6thWith429() throws Exception {
        int limitForPeriod = getLimitForPeriod();

        for (int i = 0; i < limitForPeriod; i++) {
            mvc.perform(get("/architecture/rate-limit")
                            .accept(MediaType.APPLICATION_JSON))
                    .andExpect(status().isOk());
        }

        mvc.perform(get("/architecture/rate-limit")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isTooManyRequests());
    }

}
