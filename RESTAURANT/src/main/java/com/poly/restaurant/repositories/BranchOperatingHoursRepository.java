package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.BranchOperatingHours;
import com.poly.restaurant.entities.enums.DayOfWeek;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface BranchOperatingHoursRepository extends JpaRepository<BranchOperatingHours, Long> {
    
    // Tìm giờ bán hàng theo chi nhánh
    List<BranchOperatingHours> findByBranchOrderByDayOfWeek(BranchEntity branch);
    
    // Tìm giờ bán hàng theo chi nhánh và ngày trong tuần
    Optional<BranchOperatingHours> findByBranchAndDayOfWeek(BranchEntity branch, DayOfWeek dayOfWeek);
    
    // Tìm tất cả chi nhánh đang mở cửa tại thời điểm hiện tại
    @Query("SELECT DISTINCT oh.branch FROM BranchOperatingHours oh " +
           "WHERE oh.dayOfWeek = :dayOfWeek " +
           "AND oh.isOpen = true " +
           "AND :currentTime BETWEEN oh.openTime AND oh.closeTime " +
           "AND oh.branch.status = 'OPEN'")
    List<BranchEntity> findOpenBranchesAtTime(@Param("dayOfWeek") DayOfWeek dayOfWeek, 
                                             @Param("currentTime") LocalTime currentTime);
    
    // Kiểm tra chi nhánh có đang mở cửa không
    @Query("SELECT COUNT(oh) > 0 FROM BranchOperatingHours oh " +
           "WHERE oh.branch = :branch " +
           "AND oh.dayOfWeek = :dayOfWeek " +
           "AND oh.isOpen = true " +
           "AND :currentTime BETWEEN oh.openTime AND oh.closeTime")
    boolean isBranchOpenAtTime(@Param("branch") BranchEntity branch,
                              @Param("dayOfWeek") DayOfWeek dayOfWeek,
                              @Param("currentTime") LocalTime currentTime);
    
    // Xóa tất cả giờ bán hàng của một chi nhánh
    void deleteByBranch(BranchEntity branch);
}
