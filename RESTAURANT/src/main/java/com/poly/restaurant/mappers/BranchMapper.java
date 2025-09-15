package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.BranchRequestDTO;
import com.poly.restaurant.dtos.BranchResponseDTO;
import com.poly.restaurant.entities.BranchEntity;

public class BranchMapper {
    public static BranchEntity toEntity(BranchRequestDTO dto) {
        if (dto == null)
            return null;
        BranchEntity entity = new BranchEntity();
        entity.setName(dto.getName());
        entity.setAddress(dto.getAddress());
        entity.setProvince(dto.getProvince());
        entity.setDistrict(dto.getDistrict());
        entity.setWard(dto.getWard());
        entity.setPhone(dto.getPhone());
        entity.setDescription(dto.getDescription());
        entity.setCreatedBy(dto.getCreatedBy());
        entity.setLatitude(dto.getLatitude());
        entity.setLongitude(dto.getLongitude());
        entity.setStatus(dto.getStatus());
        return entity;
    }

    public static BranchResponseDTO toResponseDto(BranchEntity entity) {
        if (entity == null)
            return null;
        BranchResponseDTO dto = new BranchResponseDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setAddress(entity.getAddress());
        dto.setProvince(entity.getProvince());
        dto.setDistrict(entity.getDistrict());
        dto.setWard(entity.getWard());
        dto.setPhone(entity.getPhone());
        dto.setDescription(entity.getDescription());
        dto.setLatitude(entity.getLatitude());
        dto.setLongitude(entity.getLongitude());
        dto.setCreatedBy(entity.getCreatedBy());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        dto.setStatus(entity.getStatus());
        return dto;
    }

    public static void updateEntityFromDto(BranchRequestDTO dto, BranchEntity entity) {
        if (dto == null || entity == null)
            return;
        if (dto.getName() != null)
            entity.setName(dto.getName());
        if (dto.getAddress() != null)
            entity.setAddress(dto.getAddress());
        if (dto.getProvince() != null)
            entity.setProvince(dto.getProvince());
        if (dto.getDistrict() != null)
            entity.setDistrict(dto.getDistrict());
        if (dto.getWard() != null)
            entity.setWard(dto.getWard());
        if (dto.getPhone() != null)
            entity.setPhone(dto.getPhone());
        if (dto.getLatitude() != null)
            entity.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null)
            entity.setLongitude(dto.getLongitude());
        if (dto.getDescription() != null)
            entity.setDescription(dto.getDescription());
        if (dto.getStatus() != null)
            entity.setStatus(dto.getStatus());
    }
}