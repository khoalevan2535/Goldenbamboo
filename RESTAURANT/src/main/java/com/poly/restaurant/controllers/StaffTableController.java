package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.TableResponseDTO;
import com.poly.restaurant.services.TableService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/api/staff/tables")
@RequiredArgsConstructor
public class StaffTableController {

    private static final Logger logger = LoggerFactory.getLogger(StaffTableController.class);
    private final TableService tableService;

    /**
     * Lấy tất cả các bàn (cho staff)
     * GET /api/staff/tables
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<TableResponseDTO>> getAllTables(
            @org.springframework.security.core.annotation.AuthenticationPrincipal com.poly.restaurant.entities.AccountEntity loggedInUser) {
        try {
            // Nếu là manager, tự động filter theo branch của họ
            if (loggedInUser != null && loggedInUser.getRole() != null && 
                "ROLE_MANAGER".equals(loggedInUser.getRole().getName())) {
                Long branchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
                if (branchId != null) {
                    logger.info("Staff getting tables for manager's branch: {}", branchId);
                    List<TableResponseDTO> tables = tableService.getTablesByBranch(branchId);
                    return ResponseEntity.ok(tables);
                }
            }
            
            logger.info("Staff getting all tables");
            List<TableResponseDTO> tables = tableService.getAllTables();
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            logger.error("Error getting all tables", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy danh sách bàn theo chi nhánh
     * GET /api/staff/tables/branch/{branchId}
     */
    @GetMapping("/branch/{branchId}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<TableResponseDTO>> getTablesByBranch(@PathVariable Long branchId) {
        try {
            logger.info("Staff getting tables for branch: {}", branchId);
            List<TableResponseDTO> tables = tableService.getTablesByBranch(branchId);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            logger.error("Error getting tables for branch: {}", branchId, e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy thông tin một bàn theo ID
     * GET /api/staff/tables/{id}
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<TableResponseDTO> getTableById(@PathVariable Long id) {
        try {
            logger.info("Staff getting table by ID: {}", id);
            TableResponseDTO table = tableService.getTableById(id);
            return ResponseEntity.ok(table);
        } catch (Exception e) {
            logger.error("Error getting table by ID: {}", id, e);
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Lấy danh sách bàn có sẵn (AVAILABLE)
     * GET /api/staff/tables/available
     */
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<TableResponseDTO>> getAvailableTables() {
        try {
            logger.info("Staff getting available tables");
            List<TableResponseDTO> tables = tableService.getAvailableTables();
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            logger.error("Error getting available tables", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Lấy danh sách bàn có sẵn theo chi nhánh
     * GET /api/staff/tables/branch/{branchId}/available
     */
    @GetMapping("/branch/{branchId}/available")
    @PreAuthorize("hasAnyRole('STAFF', 'MANAGER', 'ADMIN')")
    public ResponseEntity<List<TableResponseDTO>> getAvailableTablesByBranch(@PathVariable Long branchId) {
        try {
            logger.info("Staff getting available tables for branch: {}", branchId);
            List<TableResponseDTO> tables = tableService.getAvailableTablesByBranch(branchId);
            return ResponseEntity.ok(tables);
        } catch (Exception e) {
            logger.error("Error getting available tables for branch: {}", branchId, e);
            return ResponseEntity.badRequest().build();
        }
    }
}







