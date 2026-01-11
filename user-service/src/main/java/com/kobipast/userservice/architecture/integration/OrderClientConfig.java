package com.kobipast.userservice.architecture.integration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class OrderClientConfig {

    @Bean
    public WebClient orderWebClient() {
        return WebClient.builder()
                .baseUrl("http://localhost:8082")
                .build();
    }
}
