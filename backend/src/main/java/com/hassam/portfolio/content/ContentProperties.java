package com.hassam.portfolio.content;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.core.io.Resource;

/**
 * @param location where the portfolio JSON lives; point it at a {@code file:}
 *                 URL to edit content without rebuilding the jar.
 */
@ConfigurationProperties(prefix = "portfolio.content")
public record ContentProperties(Resource location) {
}
