package com.wholesale.platform.service;

import com.wholesale.platform.dto.CategoryDTO;
import com.wholesale.platform.entity.Category;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.exception.DuplicateResourceException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final AuditService auditService;

    public List<CategoryDTO> getAllCategories() {
        return categoryRepository.findByDeletedFalse().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public List<CategoryDTO> getRootCategories() {
        return categoryRepository.findByParentIsNullAndDeletedFalse().stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public CategoryDTO getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO createCategory(CategoryDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new DuplicateResourceException("Category already exists: " + dto.getName());
        }

        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .imageUrl(dto.getImageUrl())
                .build();

        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category", "id", dto.getParentId()));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        auditService.log(AuditAction.PRODUCT_CREATION, "Category", category.getId(),
                "Category created: " + category.getName());
        return mapToDTO(category);
    }

    @Transactional
    public CategoryDTO updateCategory(UUID id, CategoryDTO dto) {
        Category category = categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (dto.getName() != null) category.setName(dto.getName());
        if (dto.getDescription() != null) category.setDescription(dto.getDescription());
        if (dto.getImageUrl() != null) category.setImageUrl(dto.getImageUrl());
        if (dto.getParentId() != null) {
            Category parent = categoryRepository.findById(dto.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Parent category", "id", dto.getParentId()));
            category.setParent(parent);
        }

        category = categoryRepository.save(category);
        auditService.log(AuditAction.PRODUCT_UPDATE, "Category", id, "Category updated: " + category.getName());
        return mapToDTO(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .filter(c -> !c.isDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        category.setDeleted(true);
        category.setDeletedAt(LocalDateTime.now());
        categoryRepository.save(category);
        auditService.log(AuditAction.PRODUCT_DELETE, "Category", id, "Category deleted: " + category.getName());
    }

    private CategoryDTO mapToDTO(Category c) {
        return CategoryDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .description(c.getDescription())
                .imageUrl(c.getImageUrl())
                .parentId(c.getParent() != null ? c.getParent().getId() : null)
                .parentName(c.getParent() != null ? c.getParent().getName() : null)
                .productCount(c.getProducts() != null ? c.getProducts().stream().filter(p -> !p.isDeleted()).count() : 0)
                .build();
    }
}
