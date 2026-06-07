package com.wholesale.platform.service;

import com.wholesale.platform.dto.WarehouseDTO;
import com.wholesale.platform.entity.Warehouse;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.exception.DuplicateResourceException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.UserRepository;
import com.wholesale.platform.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public Page<WarehouseDTO> getAllWarehouses(Pageable pageable) {
        return warehouseRepository.findByDeletedFalse(pageable).map(this::mapToDTO);
    }

    public Page<WarehouseDTO> getActiveWarehouses(Pageable pageable) {
        return warehouseRepository.findByActiveAndDeletedFalse(true, pageable).map(this::mapToDTO);
    }

    public WarehouseDTO getWarehouseById(UUID id) {
        Warehouse w = warehouseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        return mapToDTO(w);
    }

    @Transactional
    public WarehouseDTO createWarehouse(WarehouseDTO dto) {
        if (warehouseRepository.existsByCode(dto.getCode())) {
            throw new DuplicateResourceException("Warehouse code already exists: " + dto.getCode());
        }

        Warehouse warehouse = Warehouse.builder()
                .name(dto.getName())
                .code(dto.getCode())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .zipCode(dto.getZipCode())
                .capacity(dto.getCapacity())
                .active(true)
                .build();

        if (dto.getManagerId() != null) {
            warehouse.setManager(userRepository.findByIdAndDeletedFalse(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found")));
        }

        warehouse = warehouseRepository.save(warehouse);
        auditService.log(AuditAction.INVENTORY_CHANGE, "Warehouse", warehouse.getId(),
                "Warehouse created: " + warehouse.getName());
        return mapToDTO(warehouse);
    }

    @Transactional
    public WarehouseDTO updateWarehouse(UUID id, WarehouseDTO dto) {
        Warehouse w = warehouseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));

        if (dto.getName() != null) w.setName(dto.getName());
        if (dto.getAddress() != null) w.setAddress(dto.getAddress());
        if (dto.getCity() != null) w.setCity(dto.getCity());
        if (dto.getState() != null) w.setState(dto.getState());
        if (dto.getCountry() != null) w.setCountry(dto.getCountry());
        if (dto.getZipCode() != null) w.setZipCode(dto.getZipCode());
        if (dto.getCapacity() != null) w.setCapacity(dto.getCapacity());
        if (dto.getManagerId() != null) {
            w.setManager(userRepository.findByIdAndDeletedFalse(dto.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found")));
        }

        w = warehouseRepository.save(w);
        auditService.log(AuditAction.INVENTORY_CHANGE, "Warehouse", id, "Warehouse updated: " + w.getName());
        return mapToDTO(w);
    }

    @Transactional
    public WarehouseDTO toggleActive(UUID id) {
        Warehouse w = warehouseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        w.setActive(!w.isActive());
        warehouseRepository.save(w);
        auditService.log(AuditAction.INVENTORY_CHANGE, "Warehouse", id,
                "Warehouse " + (w.isActive() ? "activated" : "deactivated") + ": " + w.getName());
        return mapToDTO(w);
    }

    @Transactional
    public void deleteWarehouse(UUID id) {
        Warehouse w = warehouseRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Warehouse", "id", id));
        w.setDeleted(true);
        w.setDeletedAt(LocalDateTime.now());
        w.setActive(false);
        warehouseRepository.save(w);
        auditService.log(AuditAction.INVENTORY_CHANGE, "Warehouse", id, "Warehouse deleted: " + w.getName());
    }

    private WarehouseDTO mapToDTO(Warehouse w) {
        return WarehouseDTO.builder()
                .id(w.getId())
                .name(w.getName())
                .code(w.getCode())
                .address(w.getAddress())
                .city(w.getCity())
                .state(w.getState())
                .country(w.getCountry())
                .zipCode(w.getZipCode())
                .capacity(w.getCapacity())
                .active(w.isActive())
                .managerId(w.getManager() != null ? w.getManager().getId() : null)
                .managerName(w.getManager() != null ? w.getManager().getFirstName() + " " + w.getManager().getLastName() : null)
                .createdAt(w.getCreatedAt())
                .build();
    }
}
