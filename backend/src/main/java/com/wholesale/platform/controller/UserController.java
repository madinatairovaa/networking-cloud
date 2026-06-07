package com.wholesale.platform.controller;

import com.wholesale.platform.dto.ApiResponse;
import com.wholesale.platform.dto.CreateUserRequest;
import com.wholesale.platform.dto.UserDTO;
import com.wholesale.platform.entity.enums.AccountStatus;
import com.wholesale.platform.entity.enums.RoleName;
import com.wholesale.platform.service.UserService;
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
@RequestMapping("/v1/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User management endpoints")
public class UserController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all users")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getAllUsers(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getAllUsers(pageable)));
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Search users")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> searchUsers(
            @RequestParam String q, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.searchUsers(q, pageable)));
    }

    @GetMapping("/role/{roleName}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get users by role")
    public ResponseEntity<ApiResponse<Page<UserDTO>>> getUsersByRole(
            @PathVariable RoleName roleName, @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUsersByRole(roleName, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    @Operation(summary = "Get user by ID")
    public ResponseEntity<ApiResponse<UserDTO>> getUserById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(userService.getUserById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CREATE_ADMIN','CREATE_MANAGER','CREATE_SELLER')")
    @Operation(summary = "Create user")
    public ResponseEntity<ApiResponse<UserDTO>> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.ok(ApiResponse.success("User created", userService.createUser(request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAuthority('MANAGE_ACCOUNT_STATUS')")
    @Operation(summary = "Update user status")
    public ResponseEntity<ApiResponse<UserDTO>> updateStatus(
            @PathVariable UUID id, @RequestParam AccountStatus status) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateUserStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('SOFT_DELETE_USERS')")
    @Operation(summary = "Soft delete user")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID id) {
        userService.softDeleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    @PostMapping("/{id}/restore")
    @PreAuthorize("hasAuthority('RESTORE_USERS')")
    @Operation(summary = "Restore deleted user")
    public ResponseEntity<ApiResponse<UserDTO>> restoreUser(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("User restored", userService.restoreUser(id)));
    }

    @PutMapping("/{id}/profile")
    @PreAuthorize("#id == authentication.principal.id or hasRole('ADMIN')")
    @Operation(summary = "Update profile")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            @PathVariable UUID id, @RequestBody UserDTO dto) {
        return ResponseEntity.ok(ApiResponse.success(userService.updateProfile(id, dto)));
    }
}
