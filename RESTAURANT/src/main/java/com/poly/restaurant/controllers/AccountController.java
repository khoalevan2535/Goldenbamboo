package com.poly.restaurant.controllers;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.poly.restaurant.dtos.*;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.services.AccountService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    /**
     * Admin/Manager tạo tài khoản nhân viên
     */
    @PostMapping("/staff")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AuthResponseDTO> registerStaff(
            @Valid @RequestBody StaffRegistrationRequestDTO request,
            Authentication authentication
    ) {
        AccountEntity loggedInUser = (AccountEntity) authentication.getPrincipal();
        AuthResponseDTO response = accountService.registerStaff(request, loggedInUser);
        return ResponseEntity.ok(response);
    }

    /**
     * Người dùng tự đăng ký tài khoản
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> registerUser(
            @Valid @RequestBody AccountRequestDTO request
    ) {
        AuthResponseDTO response = accountService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Lấy toàn bộ tài khoản với pagination (Admin/Manager)
     */
    @GetMapping
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<Page<AccountResponseDTO>> getAllAccount(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
            Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<AccountResponseDTO> accountPage = accountService.getAllAccount(pageable);
        return ResponseEntity.ok(accountPage);
    }

    /**
     * Cập nhật thông tin tài khoản
     */
    @PutMapping("/{accountId}")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AccountResponseDTO> updateAccount(
            @PathVariable Long accountId,
            @RequestBody StaffUpdateRequestDTO request
    ) {
        System.out.println("Received accountId: " + accountId);
        System.out.println("Received request: " + request);
        AccountResponseDTO updated = accountService.updateAccount(accountId, request);
        System.out.println("Updated account: " + updated);
        return ResponseEntity.ok(updated);
    }

    /**
     * Cập nhật trạng thái (Hoạt động/Tạm khóa/Đã khóa)
     */
    @PatchMapping("/{accountId}/status")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AccountResponseDTO> updateAccountStatus(
            @PathVariable Long accountId,
            @Valid @RequestBody UpdateAccountStatusRequestDTO request
    ) {
        AccountResponseDTO updatedAccount = accountService.updateAccountStatus(accountId, request.getStatus());
        return ResponseEntity.ok(updatedAccount);
    }

    /**
     * Cập nhật vai trò
     */
    @PatchMapping("/{accountId}/role")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<AccountResponseDTO> updateAccountRole(
            @PathVariable Long accountId,
            @Valid @RequestBody UpdateAccountRoleRequestDTO request
    ) {
        AccountResponseDTO updatedAccount = accountService.updateAccountRole(accountId, request.getRoleName());
        return ResponseEntity.ok(updatedAccount);
    }

    /**
     * Tìm kiếm tài khoản người dùng theo keyword
     */
    @GetMapping("/search-users")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
    public ResponseEntity<List<AccountResponseDTO>> searchUsers(@RequestParam String keyword) {
        List<AccountResponseDTO> users = accountService.searchUsersByKeyword(keyword);
        return ResponseEntity.ok(users);
    }


    
    
}
