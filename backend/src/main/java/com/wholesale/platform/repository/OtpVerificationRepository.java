package com.wholesale.platform.repository;

import com.wholesale.platform.entity.OtpVerification;
import com.wholesale.platform.entity.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, UUID> {
    Optional<OtpVerification> findByEmailAndCodeAndOtpTypeAndUsedFalse(String email, String code, OtpType otpType);
    Optional<OtpVerification> findTopByEmailAndOtpTypeAndUsedFalseOrderByCreatedAtDesc(String email, OtpType otpType);
    void deleteByEmailAndOtpType(String email, OtpType otpType);
}
