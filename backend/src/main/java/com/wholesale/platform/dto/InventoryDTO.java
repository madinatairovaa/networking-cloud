package com.wholesale.platform.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InventoryDTO {
    private UUID id;

    @NotNull(message = "Product ID is required")
    private UUID productId;
    private String productName;
    private String productSku;

    @NotNull(message = "Warehouse ID is required")
    private UUID warehouseId;
    private String warehouseName;
    private String warehouseCode;

    private int quantity;
    private int reservedQuantity;
    private int availableQuantity;
    private int reorderLevel;
    private Integer maxStockLevel;
    private boolean lowStock;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
