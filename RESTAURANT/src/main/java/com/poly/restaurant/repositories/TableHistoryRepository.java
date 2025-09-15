package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.TableHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TableHistoryRepository extends JpaRepository<TableHistoryEntity, Long> {
    
    List<TableHistoryEntity> findByTableIdOrderByCreatedAtDesc(Long tableId);
    
    List<TableHistoryEntity> findByTableIdAndActionOrderByCreatedAtDesc(Long tableId, String action);
    
    // Method với JOIN FETCH để load table
    @Query("SELECT th FROM TableHistoryEntity th LEFT JOIN FETCH th.table WHERE th.table.id = :tableId ORDER BY th.createdAt DESC")
    List<TableHistoryEntity> findByTableIdOrderByCreatedAtDescWithTable(@Param("tableId") Long tableId);
    
    @Query("SELECT th FROM TableHistoryEntity th LEFT JOIN FETCH th.table WHERE th.table.branch.id = :branchId ORDER BY th.createdAt DESC")
    List<TableHistoryEntity> findByBranchIdWithTable(@Param("branchId") Long branchId);
    
    @Query("SELECT th FROM TableHistoryEntity th WHERE th.table.id = :tableId AND th.createdAt BETWEEN :startDate AND :endDate ORDER BY th.createdAt DESC")
    List<TableHistoryEntity> findByTableIdAndDateRange(@Param("tableId") Long tableId, 
                                                      @Param("startDate") LocalDateTime startDate, 
                                                      @Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT th FROM TableHistoryEntity th WHERE th.table.branch.id = :branchId ORDER BY th.createdAt DESC")
    List<TableHistoryEntity> findByBranchId(@Param("branchId") Long branchId);
    
    @Query("SELECT th FROM TableHistoryEntity th WHERE th.action = :action AND th.createdAt >= :since ORDER BY th.createdAt DESC")
    List<TableHistoryEntity> findByActionAndSince(@Param("action") String action, 
                                                 @Param("since") LocalDateTime since);
    
    // Method để xóa tất cả history của một table
    void deleteByTableId(Long tableId);
}
