package com.hassam.portfolio.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = "portfolio.cors.allowed-origins=https://portfolio.vercel.app,https://portfolio-*.vercel.app")
@AutoConfigureMockMvc
class CorsTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void allowsExactOrigin() throws Exception {
        mockMvc.perform(get("/api/projects").header("Origin", "https://portfolio.vercel.app"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "https://portfolio.vercel.app"));
    }

    @Test
    void allowsWildcardPreviewOrigin() throws Exception {
        mockMvc.perform(get("/api/projects").header("Origin", "https://portfolio-git-main-abc.vercel.app"))
                .andExpect(status().isOk());
    }

    @Test
    void rejectsOtherOrigins() throws Exception {
        mockMvc.perform(get("/api/projects").header("Origin", "https://evil.example.com"))
                .andExpect(status().isForbidden());
    }
}
