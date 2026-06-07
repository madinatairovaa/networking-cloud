package com.wholesale.platform.service;

import com.wholesale.platform.dto.InventoryDTO;
import com.wholesale.platform.entity.Inventory;
import com.wholesale.platform.entity.Product;
import com.wholesale.platform.entity.Warehouse;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.exception.DuplicateResourceException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.InventoryRepository;
import com.wholesale.platform.repository.ProductRepository;
import com.wholesale.platform.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final WarehouseRepository warehouseRepository;
    private final AuditService auditService;

    public Page<InventoryDTO> getAllInventory(Pageable pageable) {
        return inventoryRepository.findAll(pageable).map(this::mapToDTO);
    }

    public Page<InventoryDTO> getByWarehouse(UUID warehouseId, Pageable pageable) {
        return inventoryRepository.findByWarehouseId(warehouseId, pageable).map(this::mapToDTO);
    }

    public Page<InventoryDTO> getByProduct(UUID productId, Pageable pageable) {
        return inventoryRepository.findByProductId(productId, pageable).map(this::mapToDTO);
    }

    public Page<InventoryDTO> getLowStockItems(Pageable pageable) {
        List<InventoryDTO> lowStock = inventoryRepository.findLowStockItems().stream()
                .map(this::mapToDTO).collect(Collectors.toList());
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), lowStock.size());
        return new PageImpl<>(lowStock.subList(start, end), pageable, lowStock.size());
    }

    public InventoryDTO getById(UUID id) {
        Inventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));
        return mapToDTO(inv);
    }

    @Transactional
    public InventoryDTO createInventory(InventoryDTO dto) {
        inventoryRepository.findByProductIdAndWarehouseId(dto.getProductId(), dto.getWarehouseId())
                .ifPresent(i -> {
                    throw new DuplicateResourceException("Inventory record already exists for this product/warehouse combination");
                });

        Product product = productRepository.findByIdAndDeletedFalse(dto.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", dto.getProductId()));
        Warehouse warehouse = warehouseRepository.findByIdAndDeletedFalse(dto.getWarehouseId())
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", dto.getWarehouseId()));

        Inventory inv = Inventory.builder()
                .product(product)
                .warehouse(warehouse)
                .quantity(dto.getQuantity())
                .reservedQuantity(dto.getReservedQuantity())
                .reorderLevel(dto.getReorderLevel() > 0 ? dto.getReorderLevel() : 10)
                .maxStockLevel(dto.getMaxStockLevel())
                .build();

        inv = inventoryRepository.save(inv);
        auditService.log(AuditAction.INVENTORY_CHANGE, "Inventory", inv.getId(),
                "Inventory created: " + product.getName() + " at " + warehouse.getName() + " qty=" + dto.getQuantity());
        return mapToDTO(inv);
    }

    @Transactional
    public InventoryDTO updateInventory(UUID id, InventoryDTO dto) {
        Inventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));

        int oldQty = inv.getQuantity();
        if (dto.getQuantity() >= 0) inv.setQuantity(dto.getQuantity());
        if (dto.getReservedQuantity() >= 0) inv.setReservedQuantity(dto.getReservedQuantity());
        if (dto.getReorderLevel() > 0) inv.setReorderLevel(dto.getReorderLevel());
        if (dto.getMaxStockLevel() != null) inv.setMaxStockLevel(dto.getMaxStockLevel());

        inv = inventoryRepository.save(inv);
        auditService.log(AuditAction.INVENTORY_CHANGE, "Inventory", id,
                "Inventory updated: qty " + oldQty + " -> " + inv.getQuantity(),
                String.valueOf(oldQty), String.valueOf(inv.getQuantity()));
        return mapToDTO(inv);
    }

    @Transactional
    public InventoryDTO adjustStock(UUID id, int adjustment) {
        Inventory inv = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory", "id", id));

        int oldQty = inv.getQuantity();
        int newQty = oldQty + adjustment;
        if (newQty < 0) newQty = 0;
        inv.setQuantity(newQty);
        inv = inventoryRepository.save(inv);

        auditService.log(AuditAction.INVENTORY_CHANGE, "Inventory", id,
                "Stock adjusted by " + adjustment + ": " + oldQty + " -> " + newQty,
                String.valueOf(oldQty), String.valueOf(newQty));
        return mapToDTO(inv);
    }

    private InventoryDTO mapToDTO(Inventory inv) {
        return InventoryDTO.builder()
                .id(inv.getId())
                .productId(inv.getProduct().getId())
                .productName(inv.getProduct().getName())
                .productSku(inv.getProduct().getSku())
                .warehouseId(inv.getWarehouse().getId())
                .warehouseName(inv.getWarehouse().getName())
                .warehouseCode(inv.getWarehouse().getCode())
                .quantity(inv.getQuantity())
                .reservedQuantity(inv.getReservedQuantity())
                .availableQuantity(inv.getAvailableQuantity())
                .reorderLevel(inv.getReorderLevel())
                .maxStockLevel(inv.getMaxStockLevel())
                .lowStock(inv.isLowStock())
                .createdAt(inv.getCreatedAt())
                .updatedAt(inv.getUpdatedAt())
                .build();
    }
}
