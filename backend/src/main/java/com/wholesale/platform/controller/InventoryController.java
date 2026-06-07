package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.dto.InventoryDTO;
import com.wholesale.platform.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER','SELLER')")
@Tag(name = "Inventory", description = "Inventory management endpoints")
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @Operation(summary = "Get all inventory")
    public ResponseEntity<ApiResponse<Page<InventoryDTO>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getAllInventory(pageable)));
    }

    @GetMapping("/warehouse/{warehouseId}")
    @Operation(summary = "Get inventory by warehouse")
    public ResponseEntity<ApiResponse<Page<InventoryDTO>>> byWarehouse(
            @PathVariable UUID warehouseId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getByWarehouse(warehouseId, pageable)));
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Get inventory by product")
    public ResponseEntity<ApiResponse<Page<InventoryDTO>>> byProduct(
            @PathVariable UUID productId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getByProduct(productId, pageable)));
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get low stock items")
    public ResponseEntity<ApiResponse<Page<InventoryDTO>>> lowStock(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getLowStockItems(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get inventory by ID")
    public ResponseEntity<ApiResponse<InventoryDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    @Operation(summary = "Create inventory record")
    public ResponseEntity<ApiResponse<InventoryDTO>> create(@Valid @RequestBody InventoryDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Inventory created", inventoryService.createInventory(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    @Operation(summary = "Update inventory")
    public ResponseEntity<ApiResponse<InventoryDTO>> update(@PathVariable UUID id, @RequestBody InventoryDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.updateInventory(id, dto)));
    }

    @PatchMapping("/{id}/adjust")
    @PreAuthorize("hasAuthority('MANAGE_INVENTORY')")
    @Operation(summary = "Adjust stock quantity")
    public ResponseEntity<ApiResponse<InventoryDTO>> adjustStock(
            @PathVariable UUID id, @RequestParam int adjustment) {
        return ResponseEntity.ok(ApiResponse.success(inventoryService.adjustStock(id, adjustment)));
    }
}
