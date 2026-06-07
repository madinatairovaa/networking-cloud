package com.wholesale.platform.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderDTO {
    private UUID id;
    private String orderNumber;
    private UUID userId;
    private String userName;
    private String status;
    private BigDecimal totalAmount;
    private BigDecimal taxAmount;
    private BigDecimal discountAmount;
    private String shippingAddress;
    private String billingAddress;
    private String notes;
    private LocalDateTime orderDate;
    private LocalDateTime shippedDate;
    private LocalDateTime deliveredDate;
    private List<OrderItemDTO> items;
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItemDTO {
        private UUID id;

        @NotNull(message = "Product ID is required")
        private UUID productId;

        private String productName;
        private String productSku;

        @NotNull(message = "Quantity is required")
        @Positive(message = "Quantity must be positive")
        private int quantity;

        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
        private String size;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateOrderRequest {
        @NotEmpty(message = "Order must have at least one item")
        private List<OrderItemDTO> items;

        private String shippingAddress;
        private String billingAddress;
        private String notes;
    }
}
