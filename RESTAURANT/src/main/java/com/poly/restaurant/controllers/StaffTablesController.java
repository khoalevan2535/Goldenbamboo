package com.poly.restaurant.controllers;

import com.poly.restaurant.entities.TableEntity;
import com.poly.restaurant.entities.enums.TableStatus;
import com.poly.restaurant.repositories.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/staff/tables")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffTablesController {

    private final TableRepository tableRepository;

    @GetMapping
    public ResponseEntity<List<TableEntity>> getTables(@RequestParam Long branchId) {
        List<TableEntity> tables = tableRepository.findByBranchId(branchId);
        return ResponseEntity.ok(tables);
    }

    @PutMapping("/{tableId}/status")
    public ResponseEntity<TableEntity> updateTableStatus(
            @PathVariable Long tableId,
            @RequestBody Map<String, String> request
    ) {
        String newStatus = request.get("status");
        
        TableEntity table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        
        table.setStatus(TableStatus.valueOf(newStatus));
        TableEntity updatedTable = tableRepository.save(table);
        
        return ResponseEntity.ok(updatedTable);
    }
}





