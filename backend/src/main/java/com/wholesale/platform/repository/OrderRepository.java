package com.wholesale.platform.repository;

import com.wholesale.platform.entity.Order;
import com.wholesale.platform.entity.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    Optional<Order> findByOrderNumber(String orderNumber);
    Optional<Order> findByIdAndDeletedFalse(UUID id);
    Page<Order> findByUserIdAndDeletedFalse(UUID userId, Pageable pageable);
    Page<Order> findByStatusAndDeletedFalse(OrderStatus status, Pageable pageable);
    Page<Order> findByDeletedFalse(Pageable pageable);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.deleted = false")
    long countActive();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status AND o.deleted = false")
    long countByStatus(@Param("status") OrderStatus status);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.deleted = false AND o.status != 'CANCELLED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.deleted = false AND o.status != 'CANCELLED' " +
            "AND o.orderDate BETWEEN :start AND :end")
    BigDecimal getRevenueByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.user.id = :userId AND o.deleted = false")
    long countByUserId(@Param("userId") UUID userId);
}
