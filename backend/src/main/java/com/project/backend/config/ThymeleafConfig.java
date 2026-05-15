package com.project.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.templatemode.TemplateMode;
import org.thymeleaf.templateresolver.ITemplateResolver;
import org.thymeleaf.templateresolver.StringTemplateResolver;

@Configuration
public class ThymeleafConfig {

    @Bean("stringTemplateEngine")
    public TemplateEngine templateEngine() {
        TemplateEngine engine = new TemplateEngine();
        engine.setTemplateResolver(stringTemplateResolver());
        return engine;
    }

    @Bean
    public ITemplateResolver stringTemplateResolver() {
        StringTemplateResolver resolver = new StringTemplateResolver();
        resolver.setTemplateMode(TemplateMode.HTML);
        resolver.setCacheable(false);
        return resolver;
    }
}