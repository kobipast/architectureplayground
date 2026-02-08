package com.kobipast.userservice.architecture;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.kobipast.userservice.architecture.cache.CacheDemoService;
import com.kobipast.userservice.architecture.idempotency.IdempotencyService;
import com.kobipast.userservice.architecture.integration.OrderClient;
import com.kobipast.userservice.security.JwtAuthenticationFilter;
import io.github.resilience4j.ratelimiter.RateLimiterRegistry;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@WebMvcTest(
        controllers = ArchitectureController.class,
        excludeAutoConfiguration = SecurityAutoConfiguration.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = JwtAuthenticationFilter.class
        )
)
public class ArchitectureControllerValidationTest {
    @Autowired
    MockMvc mvc;

    ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

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
    void validation_whenValidBody_returns200_andDoesNotReturnProblemDetails() throws Exception {
        // Valid request body that should bypass validation and exception handling.
        var body = Map.of(
                "name", "Kobi",
                "email", "kobi@example.com"
        );

        mvc.perform(post("/architecture/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                //  Successful responses must NOT use Problem Details media type.
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))

                // Ensure this is not a Problem Details response.
                .andExpect(jsonPath("$.status").doesNotExist())
                .andExpect(jsonPath("$.title").doesNotExist())
                .andExpect(jsonPath("$.detail").doesNotExist())
                .andExpect(jsonPath("$.type").doesNotExist())
                .andExpect(jsonPath("$.errors").doesNotExist())

                // Verify controller-specific success payload.
                .andExpect(jsonPath("$.mechanism").value("problem-details-validation"))
                .andExpect(jsonPath("$.data.receivedName").value("Kobi"))
                .andExpect(jsonPath("$.data.receivedEmail").value("kobi@example.com"));
    }

    @Test
    void validation_whenInvalidBody_returnsExactProblemDetailsShape_withErrorsAndCorrelationId() throws Exception {
        // Match your shared example as a strict contract test.
        var body = Map.of(
                "name", "",
                "email", "not-an-email"
        );

        mvc.perform(post("/architecture/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("application/problem+json")))

                // RFC7807 core fields + your chosen values.
                .andExpect(jsonPath("$.detail").value("One or more fields are invalid"))
                .andExpect(jsonPath("$.instance").value("/architecture/validation"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.title").value("Validation failed"))
                .andExpect(jsonPath("$.type").value("https://example.com/problems/validation"))

                // Custom extensions from your example.
                .andExpect(jsonPath("$.errors.name").value("name is required"))
                .andExpect(jsonPath("$.errors.email").value("email must be valid"))
                .andExpect(jsonPath("$.correlationId").isNotEmpty())
                .andExpect(jsonPath("$.correlationId").value(Matchers.matchesPattern("^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")));
    }

    @Test
    void validation_whenOnlyNameInvalid_returnsErrorOnlyForName_andStillHasCorrelationId() throws Exception {
        //Verify partial validation errors map is correct.
        var body = Map.of(
                "name", "",
                "email", "kobi@example.com"
        );

        mvc.perform(post("/architecture/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("application/problem+json")))
                .andExpect(jsonPath("$.errors.name").value("name is required"))
                .andExpect(jsonPath("$.errors.email").doesNotExist())
                .andExpect(jsonPath("$.correlationId").isNotEmpty());
    }

    @Test
    void validation_whenOnlyEmailInvalid_returnsErrorOnlyForEmail_andStillHasCorrelationId() throws Exception {
        //Verify partial validation errors map is correct.
        var body = Map.of(
                "name", "Kobi",
                "email", "not-an-email"
        );

        mvc.perform(post("/architecture/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest())
                .andExpect(content().contentTypeCompatibleWith(MediaType.valueOf("application/problem+json")))
                .andExpect(jsonPath("$.errors.name").doesNotExist())
                .andExpect(jsonPath("$.errors.email").value("email must be valid"))
                .andExpect(jsonPath("$.correlationId").isNotEmpty());
    }

}
