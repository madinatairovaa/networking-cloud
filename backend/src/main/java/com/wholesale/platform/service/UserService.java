package com.wholesale.platform.service;

import com.wholesale.platform.dto.CreateUserRequest;
import com.wholesale.platform.dto.UserDTO;
import com.wholesale.platform.entity.Role;
import com.wholesale.platform.entity.User;
import com.wholesale.platform.entity.enums.AccountStatus;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.entity.enums.RoleName;
import com.wholesale.platform.exception.BadRequestException;
import com.wholesale.platform.exception.DuplicateResourceException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.RoleRepository;
import com.wholesale.platform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public Page<UserDTO> getAllUsers(Pageable pageable) {
        return userRepository.findByDeletedFalse(pageable).map(this::mapToDTO);
    }

    public Page<UserDTO> searchUsers(String search, Pageable pageable) {
        return userRepository.searchUsers(search, pageable).map(this::mapToDTO);
    }

    public Page<UserDTO> getUsersByRole(RoleName roleName, Pageable pageable) {
        return userRepository.findByRoleName(roleName, pageable).map(this::mapToDTO);
    }

    public Page<UserDTO> getUsersByStatus(AccountStatus status, Pageable pageable) {
        return userRepository.findByStatusAndDeletedFalse(status, pageable).map(this::mapToDTO);
    }

    public UserDTO getUserById(UUID id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }

    @Transactional
    public UserDTO createUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already exists: " + request.getEmail());
        }

        RoleName roleName = RoleName.valueOf(request.getRole().toUpperCase());
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .address(request.getAddress())
                .status(AccountStatus.ACTIVE)
                .emailVerified(true)
                .forcePasswordChange(true)
                .roles(Set.of(role))
                .build();

        user = userRepository.save(user);

        auditService.log(AuditAction.USER_CREATION, "User", user.getId(),
                "User created: " + user.getEmail() + " with role: " + roleName);

        return mapToDTO(user);
    }

    @Transactional
    public UserDTO updateUserStatus(UUID id, AccountStatus status) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        AccountStatus oldStatus = user.getStatus();
        user.setStatus(status);
        userRepository.save(user);

        AuditAction action = status == AccountStatus.SUSPENDED
                ? AuditAction.ACCOUNT_SUSPENSION
                : AuditAction.ACCOUNT_ACTIVATION;

        auditService.log(action, "User", id,
                "User status changed from " + oldStatus + " to " + status,
                oldStatus.name(), status.name());

        return mapToDTO(user);
    }

    @Transactional
    public void softDeleteUser(UUID id) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setDeleted(true);
        user.setDeletedAt(LocalDateTime.now());
        user.setStatus(AccountStatus.INACTIVE);
        userRepository.save(user);

        auditService.log(AuditAction.USER_UPDATE, "User", id,
                "User soft deleted: " + user.getEmail());
    }

    @Transactional
    public UserDTO restoreUser(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!user.isDeleted()) {
            throw new BadRequestException("User is not deleted");
        }

        user.setDeleted(false);
        user.setDeletedAt(null);
        user.setStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        auditService.log(AuditAction.ACCOUNT_RESTORE, "User", id,
                "User restored: " + user.getEmail());

        return mapToDTO(user);
    }

    public Page<UserDTO> getDeletedUsers(Pageable pageable) {
        return userRepository.findByDeletedTrue(pageable).map(this::mapToDTO);
    }

    @Transactional
    public UserDTO updateProfile(UUID id, UserDTO dto) {
        User user = userRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());
        if (dto.getAddress() != null) user.setAddress(dto.getAddress());

        userRepository.save(user);
        return mapToDTO(user);
    }

    private UserDTO mapToDTO(User user) {
        Set<String> roles = user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        return UserDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .status(user.getStatus().name())
                .emailVerified(user.isEmailVerified())
                .forcePasswordChange(user.isForcePasswordChange())
                .roles(roles)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
