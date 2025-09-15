package com.poly.restaurant.mappers;

import com.poly.restaurant.dtos.ReservationRequestDTO;
import com.poly.restaurant.dtos.ReservationResponseDTO;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.ReservationEntity;
import com.poly.restaurant.entities.TableEntity;
import java.util.ArrayList;
import java.util.List;

public class ReservationMapper {
    public static ReservationEntity toEntity(ReservationRequestDTO dto) {
        if (dto == null) return null;
        ReservationEntity entity = new ReservationEntity();
        entity.setReservationTime(dto.getReservationTime());
        entity.setNumberOfGuests(dto.getNumberOfGuests());
        entity.setNotes(dto.getNotes());
        if (dto.getBranchId() != null) {
            BranchEntity branch = new BranchEntity();
            branch.setId(dto.getBranchId());
            entity.setBranch(branch);
        }
        if (dto.getTableId() != null) {
            TableEntity table = new TableEntity();
            table.setId(dto.getTableId());
            entity.setTable(table);
        }
        return entity;
    }

    public static ReservationResponseDTO toResponseDto(ReservationEntity entity) {
        if (entity == null) return null;
        ReservationResponseDTO dto = new ReservationResponseDTO();
        dto.setId(entity.getId());
        dto.setReservationTime(entity.getReservationTime());
        dto.setNumberOfGuests(entity.getNumberOfGuests());
        dto.setNotes(entity.getNotes());
        dto.setStatus(entity.getStatus());
        dto.setCreatedAt(entity.getCreatedAt());
        dto.setUpdatedAt(entity.getUpdatedAt());
        if (entity.getAccount() != null) {
            dto.setCustomerName(entity.getAccount().getName());
        }
        if (entity.getTable() != null) {
            dto.setTableName(entity.getTable().getName());
        }
        if (entity.getBranch() != null) {
            dto.setBranchName(entity.getBranch().getName());
        }
        return dto;
    }

    public static List<ReservationResponseDTO> toResponseDtoList(List<ReservationEntity> entities) {
        if (entities == null) return new ArrayList<>();
        List<ReservationResponseDTO> list = new ArrayList<>();
        for (ReservationEntity entity : entities) {
            list.add(toResponseDto(entity));
        }
        return list;
    }

    public static void updateEntityFromDto(ReservationRequestDTO dto, ReservationEntity entity) {
        if (dto == null || entity == null) return;
        if (dto.getReservationTime() != null) entity.setReservationTime(dto.getReservationTime());
        entity.setNumberOfGuests(dto.getNumberOfGuests());
        if (dto.getNotes() != null) entity.setNotes(dto.getNotes());
        if (dto.getBranchId() != null) {
            BranchEntity branch = new BranchEntity();
            branch.setId(dto.getBranchId());
            entity.setBranch(branch);
        }
        if (dto.getTableId() != null) {
            TableEntity table = new TableEntity();
            table.setId(dto.getTableId());
            entity.setTable(table);
        }
    }
} 