package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.dto.CustomerDTO;
import com.wholesale.platform.service.CustomerService;
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
@RequestMapping("/v1/customers")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
@Tag(name = "Customers", description = "Customer management endpoints")
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping
    @Operation(summary = "Get all customers")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getAllCustomers(pageable)));
    }

    @GetMapping("/search")
    @Operation(summary = "Search customers")
    public ResponseEntity<ApiResponse<Page<CustomerDTO>>> search(
            @RequestParam String q, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(customerService.searchCustomers(q, pageable)));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get customer by ID")
    public ResponseEntity<ApiResponse<CustomerDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.getCustomerById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('MANAGE_CUSTOMERS')")
    @Operation(summary = "Create customer")
    public ResponseEntity<ApiResponse<CustomerDTO>> create(@Valid @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(ApiResponse.success("Customer created", customerService.createCustomer(dto)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CUSTOMERS')")
    @Operation(summary = "Update customer")
    public ResponseEntity<ApiResponse<CustomerDTO>> update(@PathVariable UUID id, @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateCustomer(id, dto)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('MANAGE_CUSTOMERS')")
    @Operation(summary = "Delete customer")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.ok(ApiResponse.success("Customer deleted"));
    }
}
