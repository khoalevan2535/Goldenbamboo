package com.poly.restaurant.repositories;

import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.enums.BranchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional; // Thêm import

@Repository
public interface BranchRepository extends JpaRepository<BranchEntity, Long>, JpaSpecificationExecutor<BranchEntity> {

    Optional<BranchEntity> findByName(String name);

    List<BranchEntity> findByStatus(BranchStatus status);

    List<BranchEntity> findByStatusIn(List<BranchStatus> statuses);

    Long countByStatus(BranchStatus status);

}