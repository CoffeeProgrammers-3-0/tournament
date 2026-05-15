package com.project.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class StaticResourceConfig implements WebMvcConfigurer {

    @Value("${storage.local.path}")
    private String storagePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry
            .addResourceHandler("/files/**")
            .addResourceLocations("file:" + storagePath + "/");
    }
}