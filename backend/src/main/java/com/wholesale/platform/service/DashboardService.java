package com.wholesale.platform.service;

import com.wholesale.platform.dto.DashboardDTO;
import com.wholesale.platform.entity.enums.*;
import com.wholesale.platform.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final WarehouseRepository warehouseRepository;
    private final CustomerRepository customerRepository;
    private final InventoryRepository inventoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final NotificationRepository notificationRepository;
    private final CategoryRepository categoryRepository;

    public DashboardDTO getAdminDashboard() {
        LocalDateTime monthStart = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        return DashboardDTO.builder()
                .totalUsers(userRepository.countActiveUsers())
                .totalManagers(userRepository.countByRole(RoleName.MANAGER))
                .totalSellers(userRepository.countByRole(RoleName.SELLER))
                .activeUsers(userRepository.countByStatus(AccountStatus.ACTIVE))
                .totalRevenue(orderRepository.getTotalRevenue())
                .monthlyRevenue(orderRepository.getRevenueByDateRange(monthStart, LocalDateTime.now()))
                .totalOrders(orderRepository.countActive())
                .pendingOrders(orderRepository.countByStatus(OrderStatus.PENDING))
                .totalProducts(productRepository.countActive())
                .totalAuditLogs(auditLogRepository.count())
                .securityEvents(auditLogRepository.countByAction(AuditAction.SECURITY_EVENT))
                .serverStatus("HEALTHY").databaseStatus("CONNECTED").build();
    }

    public DashboardDTO getManagerDashboard() {
        Map<String, Long> ordersByStatus = new HashMap<>();
        for (OrderStatus s : OrderStatus.values()) {
            ordersByStatus.put(s.name(), orderRepository.countByStatus(s));
        }
        return DashboardDTO.builder()
                .totalInventoryItems((long) inventoryRepository.findAll().size())
                .lowStockItems((long) inventoryRepository.findLowStockItems().size())
                .totalWarehouses(warehouseRepository.countByActiveAndDeletedFalse(true) +
                        warehouseRepository.countByActiveAndDeletedFalse(false))
                .activeWarehouses(warehouseRepository.countByActiveAndDeletedFalse(true))
                .totalCustomers(customerRepository.countByDeletedFalse())
                .totalOrders(orderRepository.countActive())
                .ordersByStatus(ordersByStatus).build();
    }

    public DashboardDTO getSellerDashboard(UUID sellerId) {
        Map<String, Long> productsByStatus = new HashMap<>();
        for (ProductStatus s : ProductStatus.values()) {
            productsByStatus.put(s.name(), productRepository.countByStatus(s));
        }
        return DashboardDTO.builder()
                .productsCreated(productRepository.countBySeller(sellerId))
                .totalProducts(productRepository.countActive())
                .totalCategories((long) categoryRepository.findByDeletedFalse().size())
                .productsByStatus(productsByStatus).build();
    }

    public DashboardDTO getUserDashboard(UUID userId) {
        return DashboardDTO.builder()
                .myOrders(orderRepository.countByUserId(userId))
                .unreadNotifications(notificationRepository.countByUserIdAndReadFalse(userId)).build();
    }
}
