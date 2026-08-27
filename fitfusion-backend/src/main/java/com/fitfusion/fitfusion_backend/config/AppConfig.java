package com.fitfusion.fitfusion_backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {

    /**
     * RestTemplate with explicit timeouts for video processing.
     * Connect timeout : 5 s  — fail fast if AI service is not running.
     * Read timeout    : 300 s — 3 minutes for video analysis.
     */
    @Bean
    public RestTemplate restTemplate() {
        SimpleClientHttpRequestFactory factory =
                new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5_000);   // 5 seconds
        factory.setReadTimeout(300_000);     // 5 minutes
        return new RestTemplate(factory);
    }
}
