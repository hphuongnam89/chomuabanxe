package com.cho2hand.marketplace.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI carxOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("CarX Marketplace API")
                .version("v1")
                .description("REST API cho hệ thống đăng tin mua bán ô tô CarX."));
    }
}
