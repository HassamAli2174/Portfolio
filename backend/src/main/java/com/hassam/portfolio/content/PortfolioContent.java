package com.hassam.portfolio.content;

import java.time.LocalDate;
import java.util.List;

/**
 * The full portfolio document. Everything the site renders comes from here,
 * so updating the portfolio means editing data/portfolio.json, not markup.
 */
public record PortfolioContent(
        Profile profile,
        List<Stat> stats,
        List<Skill> skills,
        List<Interest> interests,
        List<Education> education,
        List<Experience> experience,
        List<Project> projects) {

    public record Profile(
            String name,
            String title,
            String tagline,
            List<String> roles,
            String photo,
            LocalDate birthday,
            String degree,
            String city,
            String address,
            String phone,
            String email,
            String freelance,
            String resumeUrl,
            String about,
            String summary,
            List<Social> socials) {
    }

    public record Social(String name, String url, String icon) {
    }

    public record Stat(String icon, int value, String label) {
    }

    public record Skill(String name, int level, String description) {
    }

    public record Interest(String name, String icon, String color) {
    }

    public record Education(String title, String period, String institution) {
    }

    public record Experience(String role, String period, String company, List<String> highlights) {
    }

    public record Project(
            String slug,
            String title,
            ProjectCategory category,
            String type,
            String client,
            LocalDate date,
            String url,
            String cover,
            List<String> images,
            String summary,
            List<String> description,
            List<Highlight> highlights,
            List<String> tech) {
    }

    public record Highlight(String title, String text) {
    }
}
