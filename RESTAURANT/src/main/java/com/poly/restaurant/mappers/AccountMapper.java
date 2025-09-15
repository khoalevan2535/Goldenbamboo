package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.AccountRequestDTO;
import com.poly.restaurant.dtos.AccountResponseDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.BranchEntity;
import org.hibernate.Hibernate;

public class AccountMapper {

    public static AccountEntity toEntity(AccountRequestDTO dto) {
        if (dto == null) return null;

        AccountEntity entity = new AccountEntity();
        entity.setUsername(dto.getName());
        entity.setEmail(dto.getEmail());
        entity.setPhone(dto.getPhone());
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());

        BranchEntity branch = new BranchEntity();
        branch.setId(dto.getBranchId());
        entity.setBranch(branch);

        return entity;
    }

    public static AccountResponseDTO toResponseDto(AccountEntity account) {
        if (account == null) return null;

        AccountResponseDTO dto = new AccountResponseDTO();
        dto.setId(account.getId());
        dto.setUsername(account.getUsername());
        dto.setName(account.getName());
        dto.setEmail(account.getEmail());
        dto.setPhone(account.getPhone());
        dto.setAvatarUrl(account.getAvatarUrl());
        dto.setAddress(account.getAddress());
        dto.setLatitude(account.getLatitude());
        dto.setLongitude(account.getLongitude());
        dto.setStatus(account.getStatus());
        dto.setCreateAt(account.getCreateAt());
        
        // Thiết lập thông tin khóa tài khoản
        dto.setFailedAttempts(account.getFailedAttempts());
        dto.setLockTime(account.getLockTime());
        dto.setLastFailedAttempt(account.getLastFailedAttempt());

        // Thiết lập thông tin chi nhánh
        if (account.getBranch() != null) {
            dto.setBranchId(account.getBranch().getId());
            if (Hibernate.isInitialized(account.getBranch())) {
                dto.setBranchName(account.getBranch().getName());
            }
        }

        // Thiết lập danh sách tên các vai trò (một phần tử để giữ tương thích FE)
        if (account.getRole() != null) {
            dto.setRoles(java.util.Set.of(account.getRole().getName()));
        } else {
                       dto.setRoles(java.util.Set.of());
        }

        return dto;
    }
}
