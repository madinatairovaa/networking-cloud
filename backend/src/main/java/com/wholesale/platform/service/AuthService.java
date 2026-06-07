package com.wholesale.platform.service;

import com.wholesale.platform.dto.auth.*;
import com.wholesale.platform.entity.RefreshToken;
import com.wholesale.platform.entity.Role;
import com.wholesale.platform.entity.User;
import com.wholesale.platform.entity.enums.AccountStatus;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.entity.enums.OtpType;
import com.wholesale.platform.entity.enums.RoleName;
import com.wholesale.platform.exception.BadRequestException;
import com.wholesale.platform.exception.ResourceNotFoundException;
import com.wholesale.platform.repository.RefreshTokenRepository;
import com.wholesale.platform.repository.RoleRepository;
import com.wholesale.platform.repository.UserRepository;
import com.wholesale.platform.security.JwtTokenProvider;
import com.wholesale.platform.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final OtpService otpService;
    private final AuditService auditService;

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();

        // Update last login
        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        String accessToken = tokenProvider.generateAccessToken(principal);
        String refreshTokenValue = tokenProvider.generateRefreshTokenValue();

        // Save refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .token(refreshTokenValue)
                .user(user)
                .expiresAt(
                        LocalDateTime.now().plus(
                                tokenProvider.getRefreshTokenExpiration(),
                                java.time.temporal.ChronoUnit.MILLIS
                        )
                )
                .build();
        refreshTokenRepository.save(refreshToken);

        Set<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .collect(Collectors.toSet());

        Set<String> permissions = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toSet());

        auditService.logWithEmail(AuditAction.LOGIN, request.getEmail(), "User logged in successfully");

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration())
                .email(principal.getEmail())
                .firstName(principal.getFirstName())
                .lastName(principal.getLastName())
                .roles(roles)
                .permissions(permissions)
                .forcePasswordChange(principal.isForcePasswordChange())
                .build();
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .status(AccountStatus.INACTIVE)
                .emailVerified(false)
                .roles(Set.of(userRole))
                .build();

        userRepository.save(user);

        // Generate OTP for email verification
        String otp = otpService.generateOtp(request.getEmail(), OtpType.REGISTRATION);

        auditService.logWithEmail(AuditAction.REGISTRATION, request.getEmail(), "New user registered");

        AuthResponse response = AuthResponse.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .build();

        if (otp != null) {
            response.setOtp(otp);
            response.setOtpMessage("DEV MODE: Use this OTP to verify your email: " + otp);
        }

        return response;
    }

    @Transactional
    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        OtpType type = OtpType.valueOf(request.getType().toUpperCase());
        otpService.verifyOtp(request.getEmail(), request.getCode(), type);

        if (type == OtpType.REGISTRATION) {
            User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            user.setEmailVerified(true);
            user.setStatus(AccountStatus.ACTIVE);
            userRepository.save(user);

            auditService.logWithEmail(AuditAction.OTP_VERIFICATION, request.getEmail(),
                    "Email verified via OTP");
        }

        return AuthResponse.builder()
                .email(request.getEmail())
                .otpMessage("OTP verified successfully")
                .build();
    }

    @Transactional
    public AuthResponse forgotPassword(String email) {
        User user = userRepository.findByEmailAndDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        String otp = otpService.generateOtp(email, OtpType.PASSWORD_RESET);

        AuthResponse response = AuthResponse.builder()
                .email(email)
                .otpMessage("Password reset OTP has been generated")
                .build();

        if (otp != null) {
            response.setOtp(otp);
            response.setOtpMessage("DEV MODE: Use this OTP to reset your password: " + otp);
        }

        return response;
    }

    @Transactional
    public AuthResponse resetPassword(ResetPasswordRequest request) {
        otpService.verifyOtp(request.getEmail(), request.getCode(), OtpType.PASSWORD_RESET);

        User user = userRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setForcePasswordChange(false);
        userRepository.save(user);

        auditService.logWithEmail(AuditAction.PASSWORD_CHANGE, request.getEmail(),
                "Password reset via OTP");

        return AuthResponse.builder()
                .email(request.getEmail())
                .otpMessage("Password has been reset successfully")
                .build();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request, UserPrincipal principal) {
        User user = userRepository.findByIdAndDeletedFalse(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setForcePasswordChange(false);
        userRepository.save(user);

        auditService.log(AuditAction.PASSWORD_CHANGE, "User", user.getId(),
                "Password changed by user: " + user.getEmail());
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByTokenAndRevokedFalse(request.getRefreshToken())
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));

        if (refreshToken.isExpired()) {
            refreshToken.setRevoked(true);
            refreshTokenRepository.save(refreshToken);
            throw new BadRequestException("Refresh token has expired");
        }

        User user = refreshToken.getUser();
        UserPrincipal principal = new UserPrincipal(user);

        String newAccessToken = tokenProvider.generateAccessToken(principal);

        Set<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .map(a -> a.substring(5))
                .collect(Collectors.toSet());

        Set<String> permissions = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> !a.startsWith("ROLE_"))
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpiration())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .roles(roles)
                .permissions(permissions)
                .forcePasswordChange(user.isForcePasswordChange())
                .build();
    }

    @Transactional
    public void logout(String refreshToken, UserPrincipal principal) {
        refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .ifPresent(token -> {
                    token.setRevoked(true);
                    refreshTokenRepository.save(token);
                });

        auditService.log(AuditAction.LOGOUT, "User logged out: " + principal.getEmail());
    }
}
