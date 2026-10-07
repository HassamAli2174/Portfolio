package com.hassam.portfolio.contact;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class ContactControllerTests {

    @Autowired
    private MockMvc mockMvc;

    @MockitoSpyBean
    private ContactService contactService;

    @Test
    void acceptsValidMessage() throws Exception {
        mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Ada","email":"ada@example.com","subject":"Hi","message":"I would like to work with you."}
                """))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.status").value("sent"));
        verify(contactService).send(any());
    }

    @Test
    void rejectsInvalidFields() throws Exception {
        mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"","email":"not-an-email","subject":"Hi","message":"short"}
                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.message").exists());
    }

    @Test
    void silentlyDropsHoneypotSubmissions() throws Exception {
        mockMvc.perform(post("/api/contact").contentType(MediaType.APPLICATION_JSON).content("""
                {"name":"Bot","email":"bot@example.com","subject":"Buy","message":"Cheap stuff for sale!!","website":"spam.example"}
                """))
                .andExpect(status().isAccepted());
        verify(contactService, never()).send(any());
    }
}
