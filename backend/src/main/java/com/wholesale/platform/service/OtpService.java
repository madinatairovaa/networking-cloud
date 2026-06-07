package com.wholesale.platform.service;

import com.wholesale.platform.entity.OtpVerification;
import com.wholesale.platform.entity.enums.OtpType;
import com.wholesale.platform.exception.BadRequestException;
import com.wholesale.platform.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * OTP Service - designed for easy replacement with email service later.
 * In dev mode, OTP is returned in the response.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final OtpVerificationRepository otpRepository;

    @Value("${app.otp.length}")
    private int otpLength;

    @Value("${app.otp.expiration-minutes}")
    private int expirationMinutes;

    @Value("${app.otp.dev-mode}")
    private boolean devMode;

    @Transactional
    public String generateOtp(String email, OtpType type) {
        // Invalidate previous OTPs
        otpRepository.deleteByEmailAndOtpType(email, type);

        String code = generateCode();

        OtpVerification otp = OtpVerification.builder()
                .email(email)
                .code(code)
                .otpType(type)
                .expiresAt(LocalDateTime.now().plusMinutes(expirationMinutes))
                .build();

        otpRepository.save(otp);

        // In production, this would send email via EmailService
        if (devMode) {
            log.info("=== DEV MODE OTP === Email: {} | Code: {} | Type: {} ===", email, code, type);
        }

        return devMode ? code : null;
    }

    @Transactional
    public boolean verifyOtp(String email, String code, OtpType type) {
        OtpVerification otp = otpRepository
                .findByEmailAndCodeAndOtpTypeAndUsedFalse(email, code, type)
                .orElseThrow(() -> new BadRequestException("Invalid OTP code"));

        if (otp.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        if (otp.getAttempts() >= 5) {
            throw new BadRequestException("Too many failed attempts. Please request a new OTP.");
        }

        otp.setUsed(true);
        otp.setVerified(true);
        otpRepository.save(otp);

        return true;
    }

    public boolean isOtpVerified(String email, OtpType type) {
        return otpRepository
                .findTopByEmailAndOtpTypeAndUsedFalseOrderByCreatedAtDesc(email, type)
                .map(OtpVerification::isVerified)
                .orElse(false);
    }

    private String generateCode() {
        SecureRandom random = new SecureRandom();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < otpLength; i++) {
            sb.append(random.nextInt(10));
        }
        return sb.toString();
    }
}
