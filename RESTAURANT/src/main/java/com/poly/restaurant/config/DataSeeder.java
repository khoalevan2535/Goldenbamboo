package com.poly.restaurant.config;

import com.poly.restaurant.entities.RoleEntity;
import com.poly.restaurant.repositories.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;

    @Override
    public void run(String... args) throws Exception {
        // Chỉ tạo roles mẫu
        createRoles();
    }

    private void createRoles() {
        // Danh sách các vai trò cần có
        List<String> roles = Arrays.asList("ROLE_ADMIN", "ROLE_MANAGER", "ROLE_STAFF", "ROLE_USER");

        for (String roleName : roles) {
            // Kiểm tra xem vai trò đã tồn tại chưa
            if (!roleRepository.findByName(roleName).isPresent()) {
                // Nếu chưa tồn tại, tạo mới và lưu vào DB
                RoleEntity newRole = new RoleEntity();
                newRole.setName(roleName);
                roleRepository.save(newRole);
                System.out.println("Created role: " + roleName);
            }
        }
    }
}