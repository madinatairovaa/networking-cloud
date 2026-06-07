package com.wholesale.platform.service;

import com.wholesale.platform.dto.CategoryDTO;
import com.wholesale.platform.entity.Category;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.CategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void getById_Success() {
        UUID categoryId = UUID.randomUUID();
        Category category = Category.builder()
                .name("Shirts")
                .description("All shirts")
                .build();
        category.setId(categoryId);

        when(categoryRepository.findByIdAndDeletedFalse(categoryId)).thenReturn(Optional.of(category));

        CategoryDTO result = categoryService.getCategoryById(categoryId);

        assertNotNull(result);
        assertEquals("Shirts", result.getName());
        assertEquals("All shirts", result.getDescription());
    }

    @Test
    void getById_NotFound() {
        UUID categoryId = UUID.randomUUID();
        when(categoryRepository.findByIdAndDeletedFalse(categoryId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> categoryService.getCategoryById(categoryId));
    }
}
