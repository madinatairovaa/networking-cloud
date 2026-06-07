package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.dto.WarehouseDTO;
import com.wholesale.platform.service.WarehouseService;
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
@RequestMapping("/v1/warehouses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
@Tag(name = "Warehouses", description = "Warehouse management endpoints")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Get all warehouses")
    public ResponseEntity<ApiResponse<Page<WarehouseDTO>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getAllWarehouses(pageable)));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active warehouses")
    public ResponseEntity<ApiResponse<Page<WarehouseDTO>>> getActive(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getActiveWarehouses(pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get warehouse by ID")
    public ResponseEntity<ApiResponse<WarehouseDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.getWarehouseById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_WAREHOUSES')")
    @Operation(summary = "Create warehouse")
    public ResponseEntity<ApiResponse<WarehouseDTO>> create(@Valid @RequestBody WarehouseDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Warehouse created", warehouseService.createWarehouse(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_WAREHOUSES')")
    @Operation(summary = "Update warehouse")
    public ResponseEntity<ApiResponse<WarehouseDTO>> update(@PathVariable UUID id, @RequestBody WarehouseDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.updateWarehouse(id, dto)));
    }

    @PatchMapping("/{id}/toggle-active")
    @PreAuthorize("hasAuthority('MANAGE_WAREHOUSES')")
    @Operation(summary = "Toggle warehouse active status")
    public ResponseEntity<ApiResponse<WarehouseDTO>> toggleActive(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(warehouseService.toggleActive(id)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_WAREHOUSES')")
    @Operation(summary = "Delete warehouse")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        warehouseService.deleteWarehouse(id);
        return ResponseEntity.ok(ApiResponse.success("Warehouse deleted"));
    }
}
