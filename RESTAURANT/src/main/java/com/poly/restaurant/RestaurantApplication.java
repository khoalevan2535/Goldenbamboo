package com.poly.restaurant;

// --- KIỂM TRA CÁC IMPORT NÀY ---
import com.corundumstudio.socketio.SocketIOServer;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.data.web.config.EnableSpringDataWebSupport;
import org.springframework.data.web.config.PageableHandlerMethodArgumentResolverCustomizer;
// ---------------------------------

@SpringBootApplication
@EnableScheduling
@EnableSpringDataWebSupport(pageSerializationMode = EnableSpringDataWebSupport.PageSerializationMode.VIA_DTO)
public class RestaurantApplication {

    // Dòng này để Spring tự động "tiêm" bean SocketIOServer vào đây
    private final SocketIOServer socketIOServer;

    // Constructor để nhận bean
    public RestaurantApplication(SocketIOServer socketIOServer) {
        this.socketIOServer = socketIOServer;
    }

    public static void main(String[] args) {
        SpringApplication.run(RestaurantApplication.class, args);
    }

    // Bean CommandLineRunner để khởi động server
    @Bean
    CommandLineRunner runner() {
        return args -> {
            socketIOServer.start();
            // (Tùy chọn) Thêm một log để biết server đã chạy
            System.out.println("Socket.IO server started at port 9092...");
        };
    }

    // Cấu hình Pageable để sử dụng PagedModel
    @Bean
    PageableHandlerMethodArgumentResolverCustomizer pageableCustomizer() {
        return pageableResolver -> {
            pageableResolver.setMaxPageSize(100);
        };
    }
}