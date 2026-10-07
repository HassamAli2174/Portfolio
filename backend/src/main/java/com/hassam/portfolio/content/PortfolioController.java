package com.hassam.portfolio.content;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.hassam.portfolio.content.PortfolioContent.Project;

@RestController
@RequestMapping("/api")
public class PortfolioController {

    private final PortfolioContentService contentService;

    public PortfolioController(PortfolioContentService contentService) {
        this.contentService = contentService;
    }

    @GetMapping("/portfolio")
    public PortfolioContent portfolio() {
        return contentService.getContent();
    }

    @GetMapping("/projects")
    public List<Project> projects(@RequestParam(required = false) ProjectCategory category) {
        return contentService.getProjects(category);
    }

    @GetMapping("/projects/{slug}")
    public Project project(@PathVariable String slug) {
        return contentService.getProject(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No project named " + slug));
    }
}
