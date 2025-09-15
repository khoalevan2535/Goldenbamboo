package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.TableEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.poly.restaurant.entities.enums.TableStatus;

@Repository
public interface TableRepository extends JpaRepository<TableEntity, Long> {

    Optional<TableEntity> findByName(String name);
    List<TableEntity> findByBranchId(Long branchId);
    
    // Method với JOIN FETCH để load branch
    @Query("SELECT t FROM TableEntity t LEFT JOIN FETCH t.branch WHERE t.id = :id")
    Optional<TableEntity> findByIdWithBranch(@Param("id") Long id);
    
    @Query("SELECT t FROM TableEntity t LEFT JOIN FETCH t.branch")
    List<TableEntity> findAllWithBranch();
    
    @Query("SELECT t FROM TableEntity t LEFT JOIN FETCH t.branch WHERE t.branch.id = :branchId")
    List<TableEntity> findByBranchIdWithBranch(@Param("branchId") Long branchId);
    
    // Các method mới cho nghiệp vụ hoàn thiện
    List<TableEntity> findByBranchIdAndStatusAndSeatsGreaterThanEqual(Long branchId, TableStatus status, Integer minSeats);
    List<TableEntity> findByBranchIdAndIsVipTrue(Long branchId);
    List<TableEntity> findByBranchIdAndTableType(Long branchId, String tableType);
    List<TableEntity> findByBranchIdAndArea(Long branchId, String area);
    List<TableEntity> findByBranchIdAndStatus(Long branchId, TableStatus status);
    List<TableEntity> findByStatus(TableStatus status);
    
    // Method để lấy danh sách khu vực duy nhất
    @Query("SELECT DISTINCT t.area FROM TableEntity t WHERE t.area IS NOT NULL AND t.area != '' ORDER BY t.area")
    List<String> findDistinctAreas();
    
    // Method để lấy danh sách khu vực duy nhất theo branch
    @Query("SELECT DISTINCT t.area FROM TableEntity t WHERE t.branch.id = :branchId AND t.area IS NOT NULL AND t.area != '' ORDER BY t.area")
    List<String> findDistinctAreasByBranch(@Param("branchId") Long branchId);
}