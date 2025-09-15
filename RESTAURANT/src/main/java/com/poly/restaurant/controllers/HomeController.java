package com.poly.restaurant.controllers;

import com.poly.restaurant.dtos.ClientMenuItemDTO;
import com.poly.restaurant.services.ClientMenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/client/home")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class HomeController {

    private final ClientMenuService clientMenuService;

    /**
     * GET /api/client/home/featured-menu
     * Lấy 3 món ăn đặc trưng của chi nhánh 1 cho trang home
     */
    @GetMapping("/featured-menu")
    public ResponseEntity<List<ClientMenuItemDTO>> getFeaturedMenuItems() {
        log.info("Client requesting featured menu items for home page");

        try {
            List<ClientMenuItemDTO> featuredItems = clientMenuService.getFeaturedMenuItemsForHome();

            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(featuredItems);

        } catch (Exception e) {
            log.error("Error fetching featured menu items for home page", e);
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * GET /api/client/home/health
     * Health check endpoint cho trang home
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        log.info("Home page health check requested");
        return ResponseEntity.ok("Home page is healthy");
    }
}
