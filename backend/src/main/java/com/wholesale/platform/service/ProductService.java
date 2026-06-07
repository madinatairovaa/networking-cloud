package com.wholesale.platform.service;

import com.wholesale.platform.dto.ProductDTO;
import com.wholesale.platform.entity.Category;
import com.wholesale.platform.entity.Product;
import com.wholesale.platform.entity.User;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.entity.enums.ProductStatus;
import com.wholesale.platform.exception.DuplicateResourceException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.CategoryRepository;
import com.wholesale.platform.repository.ProductRepository;
import com.wholesale.platform.repository.UserRepository;
import com.wholesale.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findByDeletedFalse(pageable).map(this::mapToDTO);
    }

    public Page<ProductDTO> searchProducts(String search, Pageable pageable) {
        return productRepository.searchProducts(search, pageable).map(this::mapToDTO);
    }

    public Page<ProductDTO> getProductsByCategory(UUID categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndDeletedFalse(categoryId, pageable).map(this::mapToDTO);
    }

    public Page<ProductDTO> getProductsBySeller(UUID sellerId, Pageable pageable) {
        return productRepository.findBySellerIdAndDeletedFalse(sellerId, pageable).map(this::mapToDTO);
    }

    public ProductDTO getProductById(UUID id) {
        Product product = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return mapToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto, UserPrincipal principal) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new DuplicateResourceException("SKU already exists: " + dto.getSku());
        }
        Product product = Product.builder()
                .name(dto.getName()).description(dto.getDescription()).sku(dto.getSku())
                .price(dto.getPrice()).wholesalePrice(dto.getWholesalePrice())
                .minOrderQuantity(Math.max(dto.getMinOrderQuantity(), 1))
                .size(dto.getSize()).color(dto.getColor()).material(dto.getMaterial())
                .brand(dto.getBrand()).imageUrl(dto.getImageUrl()).status(ProductStatus.ACTIVE).build();

        if (dto.getCategoryId() != null) {
            product.setCategory(categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId())));
        }
        product.setSeller(userRepository.findByIdAndDeletedFalse(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        product = productRepository.save(product);
        auditService.log(AuditAction.PRODUCT_CREATION, "Product", product.getId(), "Product created: " + product.getName());
        return mapToDTO(product);
    }

    @Transactional
    public ProductDTO updateProduct(UUID id, ProductDTO dto) {
        Product p = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        if (dto.getName() != null) p.setName(dto.getName());
        if (dto.getDescription() != null) p.setDescription(dto.getDescription());
        if (dto.getPrice() != null) p.setPrice(dto.getPrice());
        if (dto.getWholesalePrice() != null) p.setWholesalePrice(dto.getWholesalePrice());
        if (dto.getSize() != null) p.setSize(dto.getSize());
        if (dto.getColor() != null) p.setColor(dto.getColor());
        if (dto.getMaterial() != null) p.setMaterial(dto.getMaterial());
        if (dto.getBrand() != null) p.setBrand(dto.getBrand());
        if (dto.getImageUrl() != null) p.setImageUrl(dto.getImageUrl());
        if (dto.getStatus() != null) p.setStatus(ProductStatus.valueOf(dto.getStatus()));
        if (dto.getCategoryId() != null) {
            p.setCategory(categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", "id", dto.getCategoryId())));
        }
        p = productRepository.save(p);
        auditService.log(AuditAction.PRODUCT_UPDATE, "Product", p.getId(), "Product updated: " + p.getName());
        return mapToDTO(p);
    }

    @Transactional
    public void softDeleteProduct(UUID id) {
        Product p = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        p.setDeleted(true);
        p.setDeletedAt(LocalDateTime.now());
        p.setStatus(ProductStatus.INACTIVE);
        productRepository.save(p);
        auditService.log(AuditAction.PRODUCT_DELETE, "Product", id, "Product soft deleted: " + p.getName());
    }

    @Transactional
    public ProductDTO updateProductImage(UUID id, String imageUrl) {
        Product p = productRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        p.setImageUrl(imageUrl);
        p = productRepository.save(p);
        auditService.log(AuditAction.PRODUCT_UPDATE, "Product", p.getId(), "Product image updated: " + p.getName());
        return mapToDTO(p);
    }

    private ProductDTO mapToDTO(Product p) {
        return ProductDTO.builder().id(p.getId()).name(p.getName()).description(p.getDescription())
                .sku(p.getSku()).price(p.getPrice()).wholesalePrice(p.getWholesalePrice())
                .minOrderQuantity(p.getMinOrderQuantity()).size(p.getSize()).color(p.getColor())
                .material(p.getMaterial()).brand(p.getBrand()).imageUrl(p.getImageUrl())
                .status(p.getStatus().name())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .sellerId(p.getSeller() != null ? p.getSeller().getId() : null)
                .sellerName(p.getSeller() != null ? p.getSeller().getFullName() : null)
                .createdAt(p.getCreatedAt()).build();
    }
}
