package com.wholesale.platform.config;

import com.wholesale.platform.entity.Permission;
import com.wholesale.platform.entity.Role;
import com.wholesale.platform.entity.User;
import com.wholesale.platform.entity.enums.AccountStatus;
import com.wholesale.platform.entity.enums.RoleName;
import com.wholesale.platform.repository.PermissionRepository;
import com.wholesale.platform.repository.RoleRepository;
import com.wholesale.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        seedPermissions();
        seedRoles();
        seedDefaultUsers();
        log.info("=== Data seeding completed successfully ===");
    }

    private void seedPermissions() {
        Map<String, List<String[]>> modulePermissions = new LinkedHashMap<>();
        modulePermissions.put("USER_MANAGEMENT", new ArrayList<>(List.of(
            new String[]{"CREATE_ADMIN", "Create admin users"},
            new String[]{"CREATE_MANAGER", "Create manager users"},
            new String[]{"CREATE_SELLER", "Create seller users"},
            new String[]{"MANAGE_USERS", "Manage all users"},
            new String[]{"MANAGE_ROLES", "Manage roles"},
            new String[]{"MANAGE_PERMISSIONS", "Manage permissions"},
            new String[]{"MANAGE_ACCOUNT_STATUS", "Manage account status"},
            new String[]{"SOFT_DELETE_USERS", "Soft delete users"},
            new String[]{"RESTORE_USERS", "Restore deleted users"}
        )));
        modulePermissions.put("SYSTEM", new ArrayList<>(List.of(
            new String[]{"VIEW_AUDIT_LOGS", "View audit logs"},
            new String[]{"SYSTEM_SETTINGS", "Access system settings"},
            new String[]{"SECURITY_CENTER", "Access security center"},
            new String[]{"AWS_MONITORING", "Access AWS monitoring"},
            new String[]{"CLOUD_RESOURCE_MONITORING", "Monitor cloud resources"}
        )));
        modulePermissions.put("ANALYTICS", new ArrayList<>(List.of(
            new String[]{"BUSINESS_ANALYTICS", "View business analytics"},
            new String[]{"REVENUE_ANALYTICS", "View revenue analytics"},
            new String[]{"OPERATIONAL_ANALYTICS", "View operational analytics"},
            new String[]{"TEAM_PERFORMANCE", "View team performance"},
            new String[]{"VIEW_REPORTS", "View reports"}
        )));
        modulePermissions.put("PRODUCT", new ArrayList<>(List.of(
            new String[]{"CREATE_PRODUCTS", "Create products"},
            new String[]{"UPDATE_PRODUCTS", "Update products"},
            new String[]{"SOFT_DELETE_PRODUCTS", "Soft delete products"},
            new String[]{"UPLOAD_PRODUCT_IMAGES", "Upload product images"},
            new String[]{"MANAGE_CATEGORIES", "Manage categories"},
            new String[]{"VIEW_INVENTORY", "View inventory"},
            new String[]{"MANAGE_PRODUCT_INFO", "Manage product information"},
            new String[]{"SEARCH_PRODUCTS", "Search products"},
            new String[]{"PRODUCT_STATUS_MGMT", "Manage product status"}
        )));
        modulePermissions.put("INVENTORY", new ArrayList<>(List.of(
            new String[]{"MANAGE_INVENTORY", "Manage inventory"},
            new String[]{"MANAGE_WAREHOUSES", "Manage warehouses"}
        )));
        modulePermissions.put("ORDER", new ArrayList<>(List.of(
            new String[]{"MANAGE_ORDERS", "Manage orders"},
            new String[]{"CREATE_ORDERS", "Create orders"},
            new String[]{"TRACK_ORDERS", "Track orders"},
            new String[]{"MANAGE_CUSTOMERS", "Manage customers"}
        )));
        modulePermissions.put("PROFILE", new ArrayList<>(List.of(
            new String[]{"MANAGE_PROFILE", "Manage own profile"},
            new String[]{"VIEW_NOTIFICATIONS", "View notifications"},
            new String[]{"VIEW_PRODUCTS", "View products"}
        )));

        for (var entry : modulePermissions.entrySet()) {
            for (String[] perm : entry.getValue()) {
                if (!permissionRepository.existsByName(perm[0])) {
                    permissionRepository.save(Permission.builder()
                            .name(perm[0]).description(perm[1]).module(entry.getKey()).build());
                }
            }
        }
        log.info("Permissions seeded: {} total", permissionRepository.count());
    }

    private void seedRoles() {
        createRoleIfNotExists(RoleName.ADMIN, "System Administrator", Set.of(
                "CREATE_ADMIN","CREATE_MANAGER","CREATE_SELLER","MANAGE_USERS","MANAGE_ROLES",
                "MANAGE_PERMISSIONS","VIEW_AUDIT_LOGS","SYSTEM_SETTINGS","SECURITY_CENTER",
                "AWS_MONITORING","CLOUD_RESOURCE_MONITORING","BUSINESS_ANALYTICS","REVENUE_ANALYTICS",
                "MANAGE_ACCOUNT_STATUS","SOFT_DELETE_USERS","RESTORE_USERS","MANAGE_ORDERS",
                "VIEW_PRODUCTS","VIEW_INVENTORY","MANAGE_WAREHOUSES","MANAGE_CUSTOMERS",
                "OPERATIONAL_ANALYTICS","TEAM_PERFORMANCE","VIEW_REPORTS"
        ));
        createRoleIfNotExists(RoleName.MANAGER, "Operations Manager", Set.of(
                "CREATE_SELLER","MANAGE_INVENTORY","MANAGE_WAREHOUSES","MANAGE_ORDERS",
                "MANAGE_CUSTOMERS","VIEW_REPORTS","TEAM_PERFORMANCE","OPERATIONAL_ANALYTICS",
                "CREATE_PRODUCTS","UPDATE_PRODUCTS","VIEW_INVENTORY","VIEW_PRODUCTS",
                "MANAGE_CATEGORIES","SEARCH_PRODUCTS"
        ));
        createRoleIfNotExists(RoleName.SELLER, "Product Seller", Set.of(
                "CREATE_PRODUCTS","UPDATE_PRODUCTS","SOFT_DELETE_PRODUCTS","UPLOAD_PRODUCT_IMAGES",
                "MANAGE_CATEGORIES","VIEW_INVENTORY","MANAGE_PRODUCT_INFO","SEARCH_PRODUCTS",
                "PRODUCT_STATUS_MGMT","VIEW_PRODUCTS"
        ));
        createRoleIfNotExists(RoleName.USER, "Regular User", Set.of(
                "VIEW_PRODUCTS","CREATE_ORDERS","TRACK_ORDERS","MANAGE_PROFILE",
                "VIEW_NOTIFICATIONS"
        ));
        log.info("Roles seeded successfully");
    }

    private void createRoleIfNotExists(RoleName name, String desc, Set<String> permNames) {
        if (roleRepository.existsByName(name)) return;
        Set<Permission> perms = new HashSet<>();
        for (String pn : permNames) {
            permissionRepository.findByName(pn).ifPresent(perms::add);
        }
        roleRepository.save(Role.builder().name(name).description(desc).permissions(perms).build());
    }

    private void seedDefaultUsers() {
        createDefaultUser("Admin", "User", "admin@company.com", "Admin@123", RoleName.ADMIN);
        createDefaultUser("Manager", "User", "manager@company.com", "Manager@123", RoleName.MANAGER);
        createDefaultUser("Seller", "User", "seller@company.com", "Seller@123", RoleName.SELLER);
        log.info("Default users seeded successfully");
    }

    private void createDefaultUser(String first, String last, String email, String pwd, RoleName roleName) {
        if (userRepository.existsByEmail(email)) return;
        Role role = roleRepository.findByName(roleName).orElseThrow();
        userRepository.save(User.builder()
                .firstName(first).lastName(last).email(email)
                .password(passwordEncoder.encode(pwd))
                .status(AccountStatus.ACTIVE).emailVerified(true)
                .forcePasswordChange(true).roles(Set.of(role)).build());
        log.info("Created default {} account: {}", roleName, email);
    }
}
