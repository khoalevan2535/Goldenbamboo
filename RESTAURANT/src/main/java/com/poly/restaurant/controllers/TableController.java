package com.poly.restaurant.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poly.restaurant.dtos.TableRequestDTO;
import com.poly.restaurant.dtos.TableResponseDTO;
import com.poly.restaurant.dtos.TableStatusUpdateDTO;
import com.poly.restaurant.dtos.TableHistoryDTO;
import com.poly.restaurant.services.TableService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    /**
     * Lấy tất cả các bàn.
     * GET /api/tables
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<TableResponseDTO>> getAllTables(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity loggedInUser) {
        
        // Nếu là manager, tự động filter theo branch của họ
        if (loggedInUser != null && loggedInUser.getRole() != null && 
            "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
            Long branchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
            if (branchId != null) {
                return ResponseEntity.ok(tableService.getTablesByBranch(branchId));
            }
        }
        
        // Admin và Staff có thể xem tất cả
        List<TableResponseDTO> tables = tableService.getAllTables();
        return new ResponseEntity<>(tables, HttpStatus.OK);
    }

    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','STAFF')")
    public ResponseEntity<List<TableResponseDTO>> getTablesByBranch(@PathVariable Long branchId) {
        return ResponseEntity.ok(tableService.getTablesByBranch(branchId));
    }

    /**
     * Lấy danh sách khu vực duy nhất
     * GET /api/tables/areas
     */
    @GetMapping("/areas")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<String>> getDistinctAreas() {
        List<String> areas = tableService.getDistinctAreas();
        return ResponseEntity.ok(areas);
    }

    /**
     * Lấy danh sách khu vực duy nhất theo chi nhánh
     * GET /api/tables/areas/branch/{branchId}
     */
    @GetMapping("/areas/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<String>> getDistinctAreasByBranch(@PathVariable Long branchId) {
        List<String> areas = tableService.getDistinctAreasByBranch(branchId);
        return ResponseEntity.ok(areas);
    }

    /**
     * Lấy lịch sử bàn theo chi nhánh
     * GET /api/tables/history/branch/{branchId}
     */
    @GetMapping("/history/branch/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<TableHistoryDTO>> getTableHistoryByBranch(@PathVariable Long branchId) {
        List<TableHistoryDTO> history = tableService.getTableHistoryByBranch(branchId);
        return ResponseEntity.ok(history);
    }

    /**
     * Lấy bàn khả dụng theo sức chứa
     * GET /api/tables/available/{branchId}?minCapacity={capacity}
     */
    @GetMapping("/available/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<TableResponseDTO>> getAvailableTablesByCapacity(
            @PathVariable Long branchId,
            @org.springframework.web.bind.annotation.RequestParam(defaultValue = "1") Integer minCapacity) {
        List<TableResponseDTO> tables = tableService.getAvailableTablesByCapacity(branchId, minCapacity);
        return ResponseEntity.ok(tables);
    }

    /**
     * Lấy danh sách bàn VIP
     * GET /api/tables/vip/{branchId}
     */
    @GetMapping("/vip/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<TableResponseDTO>> getVipTables(@PathVariable Long branchId) {
        List<TableResponseDTO> tables = tableService.getVipTables(branchId);
        return ResponseEntity.ok(tables);
    }

    /**
     * Lấy thống kê bàn theo chi nhánh
     * GET /api/tables/statistics/{branchId}
     */
    @GetMapping("/statistics/{branchId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> getTableStatistics(@PathVariable Long branchId) {
        java.util.Map<String, Object> statistics = tableService.getTableStatistics(branchId);
        return ResponseEntity.ok(statistics);
    }

    /**
     * Lấy thông tin một bàn theo ID.
     * GET /api/tables/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<TableResponseDTO> getTableById(@PathVariable Long id) {
        TableResponseDTO table = tableService.getTableById(id);
        return ResponseEntity.ok(table);
    }

    /**
     * Tạo một bàn mới.
     * POST /api/tables
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TableResponseDTO> createTable(@Valid @RequestBody TableRequestDTO requestDTO,
                                                       @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity actor) {
        // Manager chỉ được tạo trong chi nhánh của mình
        if (actor != null && actor.getRole() != null && "ROLE_MANAGER".equals(actor.getRole().getName())) {
            Long managerBranchId = actor.getBranch() != null ? actor.getBranch().getId() : null;
            if (managerBranchId == null || !java.util.Objects.equals(managerBranchId, requestDTO.getBranchId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        TableResponseDTO createdTable = tableService.createTable(requestDTO);
        return new ResponseEntity<>(createdTable, HttpStatus.CREATED);
    }

    /**
     * Cập nhật thông tin một bàn.
     * PUT /api/tables/{id}
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<TableResponseDTO> updateTable(@PathVariable Long id, @Valid @RequestBody TableRequestDTO requestDTO,
                                                        @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity actor) {
        if (actor != null && actor.getRole() != null && "ROLE_MANAGER".equals(actor.getRole().getName())) {
            Long managerBranchId = actor.getBranch() != null ? actor.getBranch().getId() : null;
            if (managerBranchId == null || !tableService.tableBelongsToBranch(id, managerBranchId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        TableResponseDTO updatedTable = tableService.updateTable(id, requestDTO);
        return ResponseEntity.ok(updatedTable);
    }

    /**
     * Xóa một bàn.
     * DELETE /api/tables/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<Void> deleteTable(@PathVariable Long id,
                                            @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity actor) {
        if (actor != null && actor.getRole() != null && "ROLE_MANAGER".equals(actor.getRole().getName())) {
            Long managerBranchId = actor.getBranch() != null ? actor.getBranch().getId() : null;
            if (managerBranchId == null || !tableService.tableBelongsToBranch(id, managerBranchId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        tableService.deleteTable(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/deletability")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<java.util.Map<String, Object>> getDeletability(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.getDeletability(id));
    }
    
    /**
     * Cập nhật trạng thái của một bàn.
     * PATCH /api/tables/{id}/status
     */
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<TableResponseDTO> updateTableStatus(@PathVariable Long id, @Valid @RequestBody TableStatusUpdateDTO statusUpdateDTO,
                                                              @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity actor) {
        if (actor != null && actor.getRole() != null && "ROLE_MANAGER".equals(actor.getRole().getName())) {
            Long managerBranchId = actor.getBranch() != null ? actor.getBranch().getId() : null;
            if (managerBranchId == null || !tableService.tableBelongsToBranch(id, managerBranchId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        TableResponseDTO updatedTable = tableService.updateTableStatus(id, statusUpdateDTO.getStatus());
        return ResponseEntity.ok(updatedTable);
    }

    @PatchMapping("/{id}/operational")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<TableResponseDTO> toggleOperational(@PathVariable Long id,
                                                              @RequestBody java.util.Map<String,Object> body,
                                                              @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity actor) {
        if (actor != null && actor.getRole() != null && "ROLE_MANAGER".equals(actor.getRole().getName())) {
            Long managerBranchId = actor.getBranch() != null ? actor.getBranch().getId() : null;
            if (managerBranchId == null || !tableService.tableBelongsToBranch(id, managerBranchId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        boolean active = Boolean.TRUE.equals(body.get("active"));
        return ResponseEntity.ok(tableService.setOperational(id, active));
    }

    // ========== CÁC ENDPOINT MỚI CHO NGHIỆP VỤ HOÀN THIỆN ==========

    /**
     * Lấy lịch sử của một bàn
     * GET /api/tables/{id}/history
     */
    @GetMapping("/{id}/history")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<List<TableHistoryDTO>> getTableHistory(@PathVariable Long id) {
        List<TableHistoryDTO> history = tableService.getTableHistory(id);
        return ResponseEntity.ok(history);
    }

    /**
     * Cập nhật trạng thái bàn với ghi chú
     * PATCH /api/tables/{id}/status-with-notes
     */
    @PatchMapping("/{id}/status-with-notes")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'STAFF')")
    public ResponseEntity<TableResponseDTO> updateTableStatusWithNotes(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, Object> request,
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity actor) {
        
        if (actor != null && actor.getRole() != null && "ROLE_MANAGER".equals(actor.getRole().getName())) {
            Long managerBranchId = actor.getBranch() != null ? actor.getBranch().getId() : null;
            if (managerBranchId == null || !tableService.tableBelongsToBranch(id, managerBranchId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        String statusStr = (String) request.get("status");
        String notes = (String) request.get("notes");
        
        com.poly.restaurant.entities.enums.TableStatus status = 
            com.poly.restaurant.entities.enums.TableStatus.valueOf(statusStr);
        
        TableResponseDTO updatedTable = tableService.updateTableStatus(id, status, notes);
        return ResponseEntity.ok(updatedTable);
    }

}