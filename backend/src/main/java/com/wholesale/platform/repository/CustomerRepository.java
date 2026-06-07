package com.wholesale.platform.repository;

import com.wholesale.platform.entity.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByIdAndDeletedFalse(UUID id);
    Optional<Customer> findByEmailAndDeletedFalse(String email);
    Optional<Customer> findByUserIdAndDeletedFalse(UUID userId);
    Page<Customer> findByDeletedFalse(Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.deleted = false AND " +
            "(LOWER(c.companyName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.contactPerson) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Customer> searchCustomers(@Param("search") String search, Pageable pageable);

    long countByDeletedFalse();
}
