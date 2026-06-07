package com.wholesale.platform.repository;

import com.wholesale.platform.entity.Inventory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, UUID> {
    Optional<Inventory> findByProductIdAndWarehouseId(UUID productId, UUID warehouseId);
    Page<Inventory> findByWarehouseId(UUID warehouseId, Pageable pageable);
    Page<Inventory> findByProductId(UUID productId, Pageable pageable);

    @Query("SELECT i FROM Inventory i WHERE (i.quantity - i.reservedQuantity) <= i.reorderLevel")
    List<Inventory> findLowStockItems();

    @Query("SELECT SUM(i.quantity) FROM Inventory i WHERE i.product.id = :productId")
    Long getTotalQuantityByProduct(@Param("productId") UUID productId);
}
