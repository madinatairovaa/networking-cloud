package com.wholesale.platform.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.wholesale.platform.dto.CategoryDTO;
import com.wholesale.platform.service.CategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CategoryController.class, excludeAutoConfiguration = {
        org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration.class,
        org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration.class
})
@AutoConfigureMockMvc(addFilters = false)
class CategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CategoryService categoryService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void getCategoryById_Success() throws Exception {
        UUID categoryId = UUID.randomUUID();
        CategoryDTO dto = CategoryDTO.builder()
                .id(categoryId)
                .name("Jeans")
                .description("Denim jeans collection")
                .build();

        when(categoryService.getCategoryById(categoryId)).thenReturn(dto);

        mockMvc.perform(get("/v1/categories/" + categoryId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Jeans"))
                .andExpect(jsonPath("$.data.description").value("Denim jeans collection"));
    }
}
