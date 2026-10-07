package com.hassam.portfolio.content;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.hassam.portfolio.content.PortfolioContent.Project;

import tools.jackson.databind.json.JsonMapper;

@Service
public class PortfolioContentService {

    private static final Logger log = LoggerFactory.getLogger(PortfolioContentService.class);

    private final PortfolioContent content;

    public PortfolioContentService(ContentProperties properties, JsonMapper jsonMapper) {
        this.content = load(properties, jsonMapper);
    }

    public PortfolioContent getContent() {
        return content;
    }

    /** Projects in the order they appear in the JSON, optionally restricted to one category. */
    public List<Project> getProjects(ProjectCategory category) {
        return content.projects().stream()
                .filter(p -> category == null || p.category() == category)
                .toList();
    }

    public Optional<Project> getProject(String slug) {
        return content.projects().stream().filter(p -> p.slug().equals(slug)).findFirst();
    }

    private static PortfolioContent load(ContentProperties properties, JsonMapper jsonMapper) {
        try (InputStream in = properties.location().getInputStream()) {
            PortfolioContent loaded = jsonMapper.readValue(in, PortfolioContent.class);
            validate(loaded);
            log.info("Loaded portfolio content from {} ({} projects)", properties.location(), loaded.projects().size());
            return loaded;
        } catch (IOException e) {
            throw new UncheckedIOException("Cannot read portfolio content from " + properties.location(), e);
        }
    }

    private static void validate(PortfolioContent content) {
        Set<String> slugs = new HashSet<>();
        for (Project project : content.projects()) {
            if (!slugs.add(project.slug())) {
                throw new IllegalStateException("Duplicate project slug: " + project.slug());
            }
        }
    }
}
