package com.wholesale.platform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Wholesale Clothing Management Platform
 * Enterprise-grade cloud-native application for AWS deployment.
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableCaching
@EnableScheduling
public class WholesalePlatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(WholesalePlatformApplication.class, args);
    }
}
