package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.dto.ProductDTO;
import com.wholesale.platform.security.UserPrincipal;
import com.wholesale.platform.service.ProductService;
import com.wholesale.platform.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product management endpoints")
public class ProductController {

    private final ProductService productService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @Operation(summary = "Get all products")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getAllProducts(pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search products")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> search(
            @RequestParam String q, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.searchProducts(q, pageable)));
    }

    @GetMapping("/category/{categoryId}")
    @Operation(summary = "Get products by category")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> byCategory(
            @PathVariable UUID categoryId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsByCategory(categoryId, pageable)));
    }

    @GetMapping("/seller/{sellerId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SELLER')")
    @Operation(summary = "Get products by seller")
    public ResponseEntity<ApiResponse<Page<ProductDTO>>> bySeller(
            @PathVariable UUID sellerId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductsBySeller(sellerId, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ApiResponse<ProductDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(productService.getProductById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('CREATE_PRODUCTS')")
    @Operation(summary = "Create product")
    public ResponseEntity<ApiResponse<ProductDTO>> create(
            @Valid @RequestBody ProductDTO dto, @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Product created", productService.createProduct(dto, principal)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('UPDATE_PRODUCTS')")
    @Operation(summary = "Update product")
    public ResponseEntity<ApiResponse<ProductDTO>> update(@PathVariable UUID id, @RequestBody ProductDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(productService.updateProduct(id, dto)));
    }

    @PostMapping("/{id}/image")
    @PreAuthorize("hasAuthority('UPDATE_PRODUCTS')")
    @Operation(summary = "Upload product image")
    public ResponseEntity<ApiResponse<ProductDTO>> uploadImage(
            @PathVariable UUID id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        String imageUrl = fileStorageService.storeFile(file);
        ProductDTO updated = productService.updateProductImage(id, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Image uploaded successfully", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SOFT_DELETE_PRODUCTS')")
    @Operation(summary = "Soft delete product")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        productService.softDeleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted"));
    }
}
