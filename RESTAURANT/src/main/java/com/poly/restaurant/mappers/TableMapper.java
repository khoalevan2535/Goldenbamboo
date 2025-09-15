package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.TableRequestDTO;
import com.poly.restaurant.dtos.TableResponseDTO;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.TableEntity;

public class TableMapper {
    public static TableEntity toEntity(TableRequestDTO dto) {
        if (dto == null) return null;
        TableEntity entity = new TableEntity();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        entity.setSeats(dto.getSeats());
        entity.setArea(dto.getArea() != null ? dto.getArea() : "");
        entity.setTableType(dto.getTableType() != null ? dto.getTableType() : "STANDARD");
        entity.setNotes(dto.getNotes() != null ? dto.getNotes() : "");
        entity.setStatus(dto.getStatus());
        entity.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : "system");
        
        if (dto.getBranchId() != null) {
            BranchEntity branch = new BranchEntity();
            branch.setId(dto.getBranchId());
            entity.setBranch(branch);
        }
        return entity;
    }

    public static void updateEntityFromDto(TableRequestDTO dto, TableEntity entity) {
        if (dto == null || entity == null) {
            return;
        }
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription() != null ? dto.getDescription() : "");
        entity.setSeats(dto.getSeats());
        entity.setArea(dto.getArea() != null ? dto.getArea() : "");
        entity.setTableType(dto.getTableType() != null ? dto.getTableType() : "STANDARD");
        entity.setNotes(dto.getNotes() != null ? dto.getNotes() : "");
        entity.setStatus(dto.getStatus());
        entity.setCreatedBy(dto.getCreatedBy() != null ? dto.getCreatedBy() : "system");
        
        if (dto.getBranchId() != null) {
            if (entity.getBranch() == null || !entity.getBranch().getId().equals(dto.getBranchId())) {
                BranchEntity branch = new BranchEntity();
                branch.setId(dto.getBranchId());
                entity.setBranch(branch);
            }
        }
    }

    public static TableResponseDTO toResponseDto(TableEntity entity) {
        if (entity == null) return null;
        TableResponseDTO dto = new TableResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setDescription(entity.getDescription());
        dto.setSeats(entity.getSeats());
        dto.setArea(entity.getArea());
        dto.setTableType(entity.getTableType());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        // operationalStatus đã bị xóa, không còn cần thiết
        if (entity.getBranch() != null) {
            dto.setBranchId(entity.getBranch().getId());
            // Sử dụng try-catch để tránh LazyInitializationException
            try {
                dto.setBranchName(entity.getBranch().getName());
            } catch (Exception e) {
                // Nếu không thể truy cập branch name, set giá trị mặc định
                dto.setBranchName("Unknown Branch");
            }
        }
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt().toString());
        dto.setUpdatedAt(entity.getUpdatedAt().toString());
        return dto;
    }
} 