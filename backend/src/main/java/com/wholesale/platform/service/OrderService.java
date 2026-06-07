package com.wholesale.platform.service;

import com.wholesale.platform.dto.OrderDTO;
import com.wholesale.platform.entity.*;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.entity.enums.OrderStatus;
import com.wholesale.platform.exception.BadRequestException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.OrderRepository;
import com.wholesale.platform.repository.ProductRepository;
import com.wholesale.platform.repository.UserRepository;
import com.wholesale.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
    private static final AtomicLong orderCounter = new AtomicLong(1000);

    public Page<OrderDTO> getAllOrders(Pageable pageable) {
        return orderRepository.findByDeletedFalse(pageable).map(this::mapToDTO);
    }

    public Page<OrderDTO> getOrdersByUser(UUID userId, Pageable pageable) {
        return orderRepository.findByUserIdAndDeletedFalse(userId, pageable).map(this::mapToDTO);
    }

    public OrderDTO getOrderById(UUID id) {
        Order order = orderRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        return mapToDTO(order);
    }

    @Transactional
    public OrderDTO createOrder(OrderDTO.CreateOrderRequest request, UserPrincipal principal) {
        User user = userRepository.findByIdAndDeletedFalse(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String orderNumber = "WH-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"))
                + "-" + orderCounter.incrementAndGet();

        Order order = Order.builder()
                .orderNumber(orderNumber).user(user).status(OrderStatus.PENDING)
                .shippingAddress(request.getShippingAddress())
                .billingAddress(request.getBillingAddress())
                .notes(request.getNotes()).orderDate(LocalDateTime.now())
                .totalAmount(BigDecimal.ZERO).build();

        BigDecimal total = BigDecimal.ZERO;
        for (OrderDTO.OrderItemDTO itemDTO : request.getItems()) {
            Product product = productRepository.findByIdAndDeletedFalse(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", "id", itemDTO.getProductId()));
            BigDecimal unitPrice = product.getWholesalePrice() != null ? product.getWholesalePrice() : product.getPrice();
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemDTO.getQuantity()));
            OrderItem item = OrderItem.builder()
                    .product(product).quantity(itemDTO.getQuantity())
                    .unitPrice(unitPrice).totalPrice(itemTotal)
                    .size(itemDTO.getSize()).color(itemDTO.getColor()).build();
            order.addItem(item);
            total = total.add(itemTotal);
        }
        order.setTotalAmount(total);
        order = orderRepository.save(order);
        auditService.log(AuditAction.ORDER_CREATION, "Order", order.getId(),
                "Order created: " + orderNumber + " Total: $" + total);
        return mapToDTO(order);
    }

    @Transactional
    public OrderDTO updateOrderStatus(UUID id, OrderStatus status) {
        Order order = orderRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", "id", id));
        OrderStatus old = order.getStatus();
        order.setStatus(status);
        if (status == OrderStatus.SHIPPED) order.setShippedDate(LocalDateTime.now());
        if (status == OrderStatus.DELIVERED) order.setDeliveredDate(LocalDateTime.now());
        orderRepository.save(order);
        auditService.log(AuditAction.ORDER_UPDATE, "Order", id,
                "Order " + order.getOrderNumber() + " status: " + old + " -> " + status);
        return mapToDTO(order);
    }

    private OrderDTO mapToDTO(Order o) {
        List<OrderDTO.OrderItemDTO> items = o.getItems().stream().map(i ->
                OrderDTO.OrderItemDTO.builder().id(i.getId())
                        .productId(i.getProduct().getId()).productName(i.getProduct().getName())
                        .productSku(i.getProduct().getSku()).quantity(i.getQuantity())
                        .unitPrice(i.getUnitPrice()).totalPrice(i.getTotalPrice())
                        .size(i.getSize()).color(i.getColor()).build()
        ).collect(Collectors.toList());

        return OrderDTO.builder().id(o.getId()).orderNumber(o.getOrderNumber())
                .userId(o.getUser().getId()).userName(o.getUser().getFullName())
                .status(o.getStatus().name()).totalAmount(o.getTotalAmount())
                .taxAmount(o.getTaxAmount()).discountAmount(o.getDiscountAmount())
                .shippingAddress(o.getShippingAddress()).billingAddress(o.getBillingAddress())
                .notes(o.getNotes()).orderDate(o.getOrderDate())
                .shippedDate(o.getShippedDate()).deliveredDate(o.getDeliveredDate())
                .items(items).createdAt(o.getCreatedAt()).build();
    }
}
