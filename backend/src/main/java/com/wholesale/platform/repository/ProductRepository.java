package com.wholesale.platform.repository;

import com.wholesale.platform.entity.Product;
import com.wholesale.platform.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByIdAndDeletedFalse(UUID id);

    Page<Product> findByDeletedFalse(Pageable pageable);

    Page<Product> findByStatusAndDeletedFalse(ProductStatus status, Pageable pageable);

    Page<Product> findByCategoryIdAndDeletedFalse(UUID categoryId, Pageable pageable);

    Page<Product> findBySellerIdAndDeletedFalse(UUID sellerId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.deleted = false AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.brand) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Product> searchProducts(@Param("search") String search, Pageable pageable);

    boolean existsBySku(String sku);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.deleted = false")
    long countActive();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.seller.id = :sellerId AND p.deleted = false")
    long countBySeller(@Param("sellerId") UUID sellerId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.status = :status AND p.deleted = false")
    long countByStatus(@Param("status") ProductStatus status);
}
