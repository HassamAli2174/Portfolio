package com.hassam.portfolio.content;

import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class PortfolioControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void servesWholePortfolio() throws Exception {
        mockMvc.perform(get("/api/portfolio"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.profile.name").value("Hassam Arshad"))
                .andExpect(jsonPath("$.profile.birthday").value("2002-04-04"))
                .andExpect(jsonPath("$.projects[0].slug").value("trade-finance-settlement"));
    }

    @Test
    void filtersProjectsByCategory() throws Exception {
        mockMvc.perform(get("/api/projects").param("category", "Mobile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[*].category", everyItem(is("mobile"))));
    }

    @Test
    void returnsProjectBySlug() throws Exception {
        mockMvc.perform(get("/api/projects/texatube"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("TexaTube"));
    }

    @Test
    void unknownProjectIs404() throws Exception {
        mockMvc.perform(get("/api/projects/nope")).andExpect(status().isNotFound());
    }
}
