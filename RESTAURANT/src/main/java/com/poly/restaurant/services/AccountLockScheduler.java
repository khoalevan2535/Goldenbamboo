package com.poly.restaurant.services;

import java.time.LocalDateTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.enums.AccountStatus;
import com.poly.restaurant.repositories.AccountRepository;

@Service
public class AccountLockScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AccountLockScheduler.class);

    @Autowired
    private AccountRepository accountRepository;

    /**
     * Chạy mỗi 5 phút để kiểm tra và reset các tài khoản bị khóa tạm thời
     */
    @Scheduled(fixedRate = 300000) // 5 phút = 300,000 ms
    @Transactional
    public void resetExpiredAccountLocks() {
        logger.info("Starting scheduled task to reset expired account locks...");
        
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        
        // Tìm tất cả tài khoản bị khóa tạm thời và đã quá 1 giờ
        List<AccountEntity> lockedAccounts = accountRepository.findByStatusAndLockTimeBefore(
            AccountStatus.INACTIVE, oneHourAgo);
        
        int resetCount = 0;
        
        for (AccountEntity account : lockedAccounts) {
            try {
                // Reset số lần thất bại và mở khóa tài khoản
                account.setFailedAttempts(0);
                account.setLockTime(null);
                account.setLastFailedAttempt(null);
                account.setStatus(AccountStatus.ACTIVE);
                
                accountRepository.save(account);
                resetCount++;
                
                logger.info("Reset account lock for: {}", account.getEmail());
            } catch (Exception e) {
                logger.error("Error resetting account lock for: {}", account.getEmail(), e);
            }
        }
        
        logger.info("Completed resetting {} expired account locks", resetCount);
    }

    /**
     * Chạy mỗi giờ để reset số lần thất bại cho các tài khoản chưa bị khóa
     * nhưng có lần thất bại cuối cùng cách đây hơn 1 giờ
     */
    @Scheduled(fixedRate = 3600000) // 1 giờ = 3,600,000 ms
    @Transactional
    public void resetFailedAttemptsAfterOneHour() {
        logger.info("Starting scheduled task to reset failed attempts after one hour...");
        
        LocalDateTime oneHourAgo = LocalDateTime.now().minusHours(1);
        
        // Tìm tất cả tài khoản có lần thất bại cuối cùng cách đây hơn 1 giờ
        List<AccountEntity> accountsWithOldFailedAttempts = accountRepository.findByLastFailedAttemptBefore(oneHourAgo);
        
        int resetCount = 0;
        
        for (AccountEntity account : accountsWithOldFailedAttempts) {
            try {
                // Chỉ reset nếu tài khoản không bị khóa tạm thời
                if (account.getLockTime() == null || 
                    account.getLastFailedAttempt().isBefore(account.getLockTime().plusHours(1))) {
                    
                    account.setFailedAttempts(0);
                    account.setLastFailedAttempt(null);
                    
                    accountRepository.save(account);
                    resetCount++;
                    
                    logger.info("Reset failed attempts for: {}", account.getEmail());
                }
            } catch (Exception e) {
                logger.error("Error resetting failed attempts for: {}", account.getEmail(), e);
            }
        }
        
        logger.info("Completed resetting failed attempts for {} accounts", resetCount);
    }
}
