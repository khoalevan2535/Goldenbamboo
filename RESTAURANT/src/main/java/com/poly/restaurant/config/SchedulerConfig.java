package com.poly.restaurant.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import com.poly.restaurant.services.AccountService;

import lombok.extern.slf4j.Slf4j;

@Configuration
@EnableScheduling
@Slf4j
public class SchedulerConfig {

    @Autowired
    private AccountService accountService;

    /**
     * Chạy mỗi 30 phút để dọn dẹp dữ liệu đăng ký tạm thời hết hạn
     */
    @Scheduled(fixedRate = 30 * 60 * 1000) // 30 phút
    public void cleanupUnverifiedAccounts() {
        try {
            log.info("Starting cleanup of temporary registration data...");
            accountService.cleanupUnverifiedAccounts();
            log.info("Cleanup of temporary registration data completed");
        } catch (Exception e) {
            log.error("Error during cleanup of temporary registration data: {}", e.getMessage(), e);
        }
    }
}
