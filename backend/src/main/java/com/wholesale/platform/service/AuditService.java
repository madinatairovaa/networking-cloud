package com.wholesale.platform.service;

import com.wholesale.platform.entity.AuditLog;
import com.wholesale.platform.entity.enums.AuditAction;
import com.wholesale.platform.repository.AuditLogRepository;
import com.wholesale.platform.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(AuditAction action, String description) {
        log(action, null, null, description, null, null);
    }

    @Async
    public void log(AuditAction action, String entityType, UUID entityId, String description) {
        log(action, entityType, entityId, description, null, null);
    }

    @Async
    public void log(AuditAction action, String entityType, UUID entityId,
                    String description, String oldValue, String newValue) {
        try {
            UUID userId = null;
            String userEmail = null;
            String ipAddress = null;
            String userAgent = null;

            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
                userId = principal.getId();
                userEmail = principal.getEmail();
            }

            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                ipAddress = getClientIp(request);
                userAgent = request.getHeader("User-Agent");
            }

            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .userId(userId)
                    .userEmail(userEmail)
                    .entityType(entityType)
                    .entityId(entityId)
                    .description(description)
                    .oldValue(oldValue)
                    .newValue(newValue)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
            log.debug("Audit log recorded: {} - {}", action, description);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage());
        }
    }

    public void logWithEmail(AuditAction action, String email, String description) {
        try {
            String ipAddress = null;
            String userAgent = null;

            ServletRequestAttributes attrs =
                    (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attrs != null) {
                HttpServletRequest request = attrs.getRequest();
                ipAddress = getClientIp(request);
                userAgent = request.getHeader("User-Agent");
            }

            AuditLog auditLog = AuditLog.builder()
                    .action(action)
                    .userEmail(email)
                    .description(description)
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build();

            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to record audit log: {}", e.getMessage());
        }
    }

    public Page<AuditLog> getAllLogs(Pageable pageable) {
        return auditLogRepository.findByOrderByTimestampDesc(pageable);
    }

    public Page<AuditLog> getLogsByAction(AuditAction action, Pageable pageable) {
        return auditLogRepository.findByAction(action, pageable);
    }

    public Page<AuditLog> getLogsByUser(UUID userId, Pageable pageable) {
        return auditLogRepository.findByUserId(userId, pageable);
    }

    public long getSecurityEventCount() {
        return auditLogRepository.countByAction(AuditAction.SECURITY_EVENT);
    }

    private String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
