package com.wholesale.platform.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Dashboard statistics DTOs for each role.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardDTO {

    // Admin dashboard
    private Long totalUsers;
    private Long totalManagers;
    private Long totalSellers;
    private Long activeUsers;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private Long totalOrders;
    private Long pendingOrders;
    private Long totalProducts;
    private Long activeProducts;
    private Long totalAuditLogs;
    private Long securityEvents;
    private String serverStatus;
    private String databaseStatus;

    // Manager dashboard
    private Long totalInventoryItems;
    private Long lowStockItems;
    private Long totalWarehouses;
    private Long activeWarehouses;
    private Long totalCustomers;
    private Map<String, Long> ordersByStatus;

    // Seller dashboard
    private Long productsCreated;
    private Long activeProductsBySeller;
    private Long inactiveProductsBySeller;
    private Long totalCategories;
    private Map<String, Long> productsByStatus;

    // User dashboard
    private Long myOrders;
    private Long unreadNotifications;
}
