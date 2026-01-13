package com.kobipast.userservice.architecture.integration;

import org.slf4j.MDC;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

@Configuration
public class OrderClientConfig {

    private static final String CORR_HEADER = "X-Correlation-Id";

    @Bean
    public WebClient orderWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8082")
                .filter(correlationIdOutFilter())
                .build();
    }

    private ExchangeFilterFunction correlationIdOutFilter() {
        return ExchangeFilterFunction.ofRequestProcessor(req -> {
            String cid = MDC.get("correlationId");
            if (cid == null || cid.isBlank()) {
                return Mono.just(req);
            }

            ClientRequest mutated = ClientRequest.from(req).header(CORR_HEADER, cid).build();
            return Mono.just(mutated);
        });
    }
}
