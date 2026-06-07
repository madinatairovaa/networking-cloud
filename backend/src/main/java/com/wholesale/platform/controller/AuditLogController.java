package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.entity.AuditLog;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.service.AuditService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/v1/audit-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('VIEW_AUDIT_LOGS')")
@Tag(name = "Audit Logs", description = "Audit log viewing endpoints")
public class AuditLogController {

    private final AuditService auditService;

    @GetMapping
    @Operation(summary = "Get all audit logs")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAll(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getAllLogs(pageable)));
    }

    @GetMapping("/action/{action}")
    @Operation(summary = "Get logs by action type")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> byAction(
            @PathVariable AuditAction action, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getLogsByAction(action, pageable)));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get logs by user")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> byUser(
            @PathVariable UUID userId, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(auditService.getLogsByUser(userId, pageable)));
    }
}
