package com.poly.restaurant.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.poly.restaurant.services.BranchService;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
public class TestController {

    @Autowired
    private BranchService branchService;

    /**
     * Cập nhật thông tin địa chỉ chi nhánh (endpoint test)
     * POST /api/test/update-branch-location
     */
    @PostMapping("/update-branch-location")
    public ResponseEntity<Map<String, Object>> updateBranchLocation(@RequestBody Map<String, Object> request) {
        try {
            Long branchId = Long.valueOf(request.get("branchId").toString());
            
            Map<String, Object> locationData = new HashMap<>();
            locationData.put("province", request.get("province"));
            locationData.put("district", request.get("district"));
            locationData.put("ward", request.get("ward"));
            locationData.put("latitude", request.get("latitude"));
            locationData.put("longitude", request.get("longitude"));
            
            var updatedBranch = branchService.updateBranchLocation(branchId, locationData);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Branch location updated successfully");
            response.put("branch", updatedBranch);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Error: " + e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}


