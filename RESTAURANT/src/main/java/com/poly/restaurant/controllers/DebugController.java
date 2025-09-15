package com.poly.restaurant.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.enums.ItemAvailabilityStatus;
import com.poly.restaurant.repositories.DishRepository;
import com.poly.restaurant.repositories.ComboRepository;

import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;
import com.poly.restaurant.entities.DishEntity;

@RestController
@RequestMapping("/api/debug")
@RequiredArgsConstructor
public class DebugController {

    private final DishRepository dishRepository;
    private final ComboRepository comboRepository;

    @GetMapping("/staff-branch-info")
    public ResponseEntity<Map<String, Object>> getStaffBranchInfo(@AuthenticationPrincipal AccountEntity user) {
        Map<String, Object> response = new HashMap<>();
        
        if (user != null) {
            response.put("accountId", user.getId());
            response.put("email", user.getEmail());
            response.put("role", user.getRole() != null ? user.getRole().getName() : "null");
            response.put("branchId", user.getBranch() != null ? user.getBranch().getId() : "null");
            response.put("branchName", user.getBranch() != null ? user.getBranch().getName() : "null");
            
            // Đếm món ăn theo branch
            if (user.getBranch() != null) {
                long dishCount = dishRepository.countByBranchIdAndAvailabilityStatus(user.getBranch().getId(), ItemAvailabilityStatus.AVAILABLE);
                long comboCount = comboRepository.countByBranchIdAndAvailabilityStatus(user.getBranch().getId(), ItemAvailabilityStatus.AVAILABLE);
                
                response.put("dishCount", dishCount);
                response.put("comboCount", comboCount);
            }
        } else {
            response.put("error", "User not authenticated");
        }
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/dishes-by-branch/{branchId}")
    public ResponseEntity<Map<String, Object>> getDishesByBranch(@PathVariable Long branchId) {
        try {
            List<DishEntity> dishes = dishRepository.findByBranchId(branchId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("branchId", branchId);
            response.put("totalDishes", dishes.size());
            response.put("dishes", dishes.stream().map(dish -> {
                Map<String, Object> dishInfo = new HashMap<>();
                dishInfo.put("id", dish.getId());
                dishInfo.put("name", dish.getName());
                dishInfo.put("price", dish.getBasePrice());
                dishInfo.put("availabilityStatus", dish.getAvailabilityStatus());
                dishInfo.put("branchId", dish.getBranch().getId());
                return dishInfo;
            }).collect(Collectors.toList()));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }
}
