package com.kobipast.userservice.architecture;

import com.kobipast.userservice.architecture.idempotency.IdempotencyRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class ArchitectureControllerIdempotencyTest {

    @Autowired MockMvc mvc;
    @Autowired IdempotencyRecordRepository repo;

    @BeforeEach
    void cleanup() {
        repo.deleteAll();
    }

    @Test
    void idempotency_firstCallProcesses_secondCallReplays() throws Exception {
        String key = "idem-123";
        String body = """
                { "action": "PAY", "amount": 50 }
                """;

        // 1) first call -> processed (replay=false)
        mvc.perform(post("/architecture/idempotency")
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Processed: PAY amount=50")))
                .andExpect(jsonPath("$.replay", is(false)));

        // 2) second call with same key+body -> replay=true (cached)
        mvc.perform(post("/architecture/idempotency")
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message", is("Processed: PAY amount=50")))
                .andExpect(jsonPath("$.replay", is(true)));

        // still only one record persisted
        org.junit.jupiter.api.Assertions.assertEquals(1, repo.count());
    }

    @Test
    void idempotency_sameKeyDifferentBody_returns409Conflict() throws Exception {
        String key = "idem-456";

        String body1 = """
                { "action": "PAY", "amount": 50 }
                """;

        String body2 = """
                { "action": "PAY", "amount": 51 }
                """;

        // first call ok
        mvc.perform(post("/architecture/idempotency")
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(body1))
                .andExpect(status().isCreated());

        // second call with same key but different request -> conflict
        mvc.perform(post("/architecture/idempotency")
                        .header("Idempotency-Key", key)
                        .contentType(MediaType.APPLICATION_JSON)
                        .accept(MediaType.APPLICATION_JSON)
                        .content(body2))
                .andDo(print())
                .andExpect(status().isConflict())
                .andExpect(content().contentTypeCompatibleWith("application/problem+json"))
                .andExpect(jsonPath("$.status", is(409)))
                .andExpect(jsonPath("$.title", is("Idempotency conflict")))
                .andExpect(jsonPath("$.detail", is("Idempotency-Key reused with a different request body.")))
                .andExpect(jsonPath("$.type", is("https://example.com/problems/idempotency-conflict")))
                .andExpect(jsonPath("$.instance", is("/architecture/idempotency")));
    }
}
