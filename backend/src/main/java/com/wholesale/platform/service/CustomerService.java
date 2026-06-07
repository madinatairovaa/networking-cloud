package com.wholesale.platform.service;

import com.wholesale.platform.dto.CustomerDTO;
import com.wholesale.platform.entity.Customer;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.exception.DuplicateResourceException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.CustomerRepository;
import com.wholesale.platform.repository.UserRepository;
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
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public Page<CustomerDTO> getAllCustomers(Pageable pageable) {
        return customerRepository.findByDeletedFalse(pageable).map(this::mapToDTO);
    }

    public Page<CustomerDTO> searchCustomers(String search, Pageable pageable) {
        return customerRepository.searchCustomers(search, pageable).map(this::mapToDTO);
    }

    public CustomerDTO getCustomerById(UUID id) {
        Customer customer = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        return mapToDTO(customer);
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        customerRepository.findByEmailAndDeletedFalse(dto.getEmail()).ifPresent(c -> {
            throw new DuplicateResourceException("Customer with email already exists: " + dto.getEmail());
        });

        Customer customer = Customer.builder()
                .companyName(dto.getCompanyName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .city(dto.getCity())
                .state(dto.getState())
                .country(dto.getCountry())
                .zipCode(dto.getZipCode())
                .taxId(dto.getTaxId())
                .creditLimit(dto.getCreditLimit())
                .active(true)
                .build();

        if (dto.getUserId() != null) {
            customer.setUser(userRepository.findByIdAndDeletedFalse(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found")));
        }

        customer = customerRepository.save(customer);
        auditService.log(AuditAction.USER_CREATION, "Customer", customer.getId(),
                "Customer created: " + customer.getCompanyName());
        return mapToDTO(customer);
    }

    @Transactional
    public CustomerDTO updateCustomer(UUID id, CustomerDTO dto) {
        Customer c = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));

        if (dto.getCompanyName() != null) c.setCompanyName(dto.getCompanyName());
        if (dto.getContactPerson() != null) c.setContactPerson(dto.getContactPerson());
        if (dto.getEmail() != null) c.setEmail(dto.getEmail());
        if (dto.getPhone() != null) c.setPhone(dto.getPhone());
        if (dto.getAddress() != null) c.setAddress(dto.getAddress());
        if (dto.getCity() != null) c.setCity(dto.getCity());
        if (dto.getState() != null) c.setState(dto.getState());
        if (dto.getCountry() != null) c.setCountry(dto.getCountry());
        if (dto.getZipCode() != null) c.setZipCode(dto.getZipCode());
        if (dto.getTaxId() != null) c.setTaxId(dto.getTaxId());
        if (dto.getCreditLimit() != null) c.setCreditLimit(dto.getCreditLimit());

        c = customerRepository.save(c);
        auditService.log(AuditAction.USER_UPDATE, "Customer", id, "Customer updated: " + c.getCompanyName());
        return mapToDTO(c);
    }

    @Transactional
    public void deleteCustomer(UUID id) {
        Customer c = customerRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", "id", id));
        c.setDeleted(true);
        c.setDeletedAt(LocalDateTime.now());
        c.setActive(false);
        customerRepository.save(c);
        auditService.log(AuditAction.USER_UPDATE, "Customer", id, "Customer deleted: " + c.getCompanyName());
    }

    private CustomerDTO mapToDTO(Customer c) {
        return CustomerDTO.builder()
                .id(c.getId())
                .companyName(c.getCompanyName())
                .contactPerson(c.getContactPerson())
                .email(c.getEmail())
                .phone(c.getPhone())
                .address(c.getAddress())
                .city(c.getCity())
                .state(c.getState())
                .country(c.getCountry())
                .zipCode(c.getZipCode())
                .taxId(c.getTaxId())
                .creditLimit(c.getCreditLimit())
                .active(c.isActive())
                .userId(c.getUser() != null ? c.getUser().getId() : null)
                .createdAt(c.getCreatedAt())
                .build();
    }
}
