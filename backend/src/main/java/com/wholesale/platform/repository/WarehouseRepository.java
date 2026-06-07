package com.wholesale.platform.repository;

import com.wholesale.platform.entity.Warehouse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarehouseRepository extends JpaRepository<Warehouse, UUID> {
    Optional<Warehouse> findByIdAndDeletedFalse(UUID id);
    Optional<Warehouse> findByCodeAndDeletedFalse(String code);
    Page<Warehouse> findByDeletedFalse(Pageable pageable);
    Page<Warehouse> findByActiveAndDeletedFalse(boolean active, Pageable pageable);
    boolean existsByCode(String code);
    long countByActiveAndDeletedFalse(boolean active);
}
