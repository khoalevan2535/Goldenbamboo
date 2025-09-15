package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.BranchOperatingHoursDTO;
import com.poly.restaurant.entities.BranchOperatingHours;
import org.springframework.stereotype.Component;

@Component
public class BranchOperatingHoursMapper {
    
    public BranchOperatingHoursDTO toDto(BranchOperatingHours entity) {
        if (entity == null) {
            return null;
        }
        
        BranchOperatingHoursDTO dto = new BranchOperatingHoursDTO();
        dto.setId(entity.getId());
        dto.setBranchId(entity.getBranch().getId());
        dto.setDayOfWeek(entity.getDayOfWeek());
        dto.setOpenTime(entity.getOpenTime());
        dto.setCloseTime(entity.getCloseTime());
        dto.setOpen(entity.isOpen());
        dto.setDescription(entity.getDescription());
        dto.setDayDisplayName(entity.getDayOfWeek().getDisplayName());
        dto.setOperatingHoursString(entity.getOperatingHoursString());
        
        return dto;
    }
    
    public BranchOperatingHours toEntity(BranchOperatingHoursDTO dto) {
        if (dto == null) {
            return null;
        }
        
        BranchOperatingHours entity = new BranchOperatingHours();
        entity.setId(dto.getId());
        entity.setDayOfWeek(dto.getDayOfWeek());
        entity.setOpenTime(dto.getOpenTime());
        entity.setCloseTime(dto.getCloseTime());
        entity.setOpen(dto.isOpen());
        entity.setDescription(dto.getDescription());
        
        return entity;
    }
}
