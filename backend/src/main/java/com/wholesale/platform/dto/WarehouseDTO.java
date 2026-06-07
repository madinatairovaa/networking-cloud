package com.wholesale.platform.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class WarehouseDTO {
    private UUID id;

    @NotBlank(message = "Warehouse name is required")
    private String name;

    @NotBlank(message = "Warehouse code is required")
    private String code;

    @NotBlank(message = "Address is required")
    private String address;

    private String city;
    private String state;
    private String country;
    private String zipCode;
    private Integer capacity;
    private boolean active;
    private UUID managerId;
    private String managerName;
    private LocalDateTime createdAt;
}
