package com.hassam.portfolio.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import com.hassam.portfolio.content.ProjectCategory;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String[] allowedOrigins;

    public WebConfig(@Value("${portfolio.cors.allowed-origins}") String[] allowedOrigins) {
        this.allowedOrigins = allowedOrigins;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Patterns accept exact origins as well as wildcards such as https://my-site-*.vercel.app.
        registry.addMapping("/api/**").allowedOriginPatterns(allowedOrigins).allowedMethods("GET", "POST");
    }

    /** Lets {@code ?category=Web} bind case-insensitively. */
    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(String.class, ProjectCategory.class,
                (Converter<String, ProjectCategory>) ProjectCategory::fromId);
    }
}
