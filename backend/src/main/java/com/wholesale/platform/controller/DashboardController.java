package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.dto.DashboardDTO;
import com.wholesale.platform.security.UserPrincipal;
import com.wholesale.platform.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/v1/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-based dashboard endpoints")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDTO>> adminDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getAdminDashboard()));
    }

    @GetMapping("/manager")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    @Operation(summary = "Manager dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDTO>> managerDashboard() {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getManagerDashboard()));
    }

    @GetMapping("/seller")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','SELLER')")
    @Operation(summary = "Seller dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDTO>> sellerDashboard(@AuthenticationPrincipal UserPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getSellerDashboard(p.getId())));
    }

    @GetMapping("/user")
    @Operation(summary = "User dashboard statistics")
    public ResponseEntity<ApiResponse<DashboardDTO>> userDashboard(@AuthenticationPrincipal UserPrincipal p) {
        return ResponseEntity.ok(ApiResponse.success(dashboardService.getUserDashboard(p.getId())));
    }
}
