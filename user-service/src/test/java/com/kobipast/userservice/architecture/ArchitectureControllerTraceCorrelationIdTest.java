package com.kobipast.userservice.architecture;

import com.kobipast.userservice.architecture.cache.CacheDemoService;
import com.kobipast.userservice.architecture.idempotency.IdempotencyService;
import com.kobipast.userservice.architecture.integration.OrderClient;
import com.kobipast.userservice.security.JwtAuthenticationFilter;
import com.kobipast.userservice.architecture.observability.CorrelationIdFilter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = ArchitectureController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
@AutoConfigureMockMvc
class ArchitectureControllerTraceCorrelationIdTest {

    @Autowired
    MockMvc mvc;

    @MockitoBean
    IdempotencyService idempotencyService;
    @MockitoBean
    CacheDemoService cacheDemoService;
    @MockitoBean
    OrderClient orderClient;
    @MockitoBean
    RateLimiterRegistry rateLimiterRegistry;
    @MockitoBean
    CacheManager cacheManager;

    @Test
    void trace_whenNoCorrelationIdProvided_generatesOne_andReturnsItInHeader() throws Exception {
        mvc.perform(get("/architecture/trace")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().exists(CorrelationIdFilter.HEADER))
                .andExpect(header().string(CorrelationIdFilter.HEADER, Matchers.matchesPattern(
                        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
                )));
    }

    @Test
    void trace_whenCorrelationIdProvided_echoesSameValueInResponseHeader() throws Exception {
        String cid = "11111111-2222-3333-4444-555555555555";

        mvc.perform(get("/architecture/trace")
                        .header(CorrelationIdFilter.HEADER, cid)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().string(CorrelationIdFilter.HEADER, cid));
    }

    @Test
    void trace_whenBlankCorrelationIdProvided_generatesNewOne() throws Exception {
        mvc.perform(get("/architecture/trace")
                        .header(CorrelationIdFilter.HEADER, "   ")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(header().exists(CorrelationIdFilter.HEADER))
                .andExpect(header().string(CorrelationIdFilter.HEADER, Matchers.matchesPattern(
                        "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
                )));
    }
}
