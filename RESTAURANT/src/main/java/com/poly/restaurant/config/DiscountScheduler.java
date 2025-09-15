package com.poly.restaurant.config;

import com.poly.restaurant.services.DiscountService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DiscountScheduler {

    private final DiscountService discountService;

    // Run every 5 minutes to update discount statuses
    @Scheduled(fixedRate = 120000) // 5 minutes = 300,000 milliseconds
    public void updateDiscountStatuses() {
        try {
            log.info("Starting scheduled discount status update...");
            
            // 1. Tự động áp dụng discount khi đến giờ
            discountService.autoApplyDiscounts();
            
            // 2. Tự động gỡ bỏ discount khi hết hạn
            discountService.autoRemoveExpiredDiscounts();
            
            // 3. Cập nhật status cơ bản (nếu cần)
            discountService.updateDiscountStatuses();
            
            log.info("Completed scheduled discount status update");
        } catch (Exception e) {
            log.error("Error updating discount statuses: {}", e.getMessage(), e);
        }
    }
}











