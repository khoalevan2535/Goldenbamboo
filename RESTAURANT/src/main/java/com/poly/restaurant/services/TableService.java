package com.poly.restaurant.services;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poly.restaurant.dtos.TableRequestDTO;
import com.poly.restaurant.dtos.TableResponseDTO;
import com.poly.restaurant.dtos.TableHistoryDTO;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.TableEntity;
import com.poly.restaurant.entities.enums.OrderStatus;
import com.poly.restaurant.entities.enums.TableStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.TableMapper;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.OrderRepository;
import com.poly.restaurant.repositories.TableRepository;
import com.poly.restaurant.repositories.TableHistoryRepository;
import com.poly.restaurant.entities.TableHistoryEntity;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TableService {

	private final TableRepository tableRepository;
	private final BranchRepository branchRepository;
	private final OrderRepository orderRepository;
	private final TableHistoryRepository tableHistoryRepository;

    @Transactional(readOnly = true)
    public List<TableResponseDTO> getAllTables() {
		return tableRepository.findAllWithBranch().stream()
				.sorted(java.util.Comparator.comparing(com.poly.restaurant.entities.TableEntity::getCreatedAt).reversed())
				.map(TableMapper::toResponseDto)
				.collect(Collectors.toList());
	}

    @Transactional(readOnly = true)
    public List<TableResponseDTO> getTablesByBranch(Long branchId) {
        return tableRepository.findByBranchIdWithBranch(branchId)
                .stream()
                .sorted(java.util.Comparator.comparing(com.poly.restaurant.entities.TableEntity::getCreatedAt).reversed())
                .map(TableMapper::toResponseDto)
                .collect(Collectors.toList());
    }

	@Transactional(readOnly = true)
	public TableResponseDTO getTableById(Long id) {
		TableEntity table = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));
		return TableMapper.toResponseDto(table);
	}

	@Transactional
	public TableResponseDTO createTable(TableRequestDTO tableDTO) {
        tableRepository.findByName(tableDTO.getName()).ifPresent(t -> {
			throw new IllegalArgumentException("Tên bàn '" + tableDTO.getName() + "' đã tồn tại.");
		});
		BranchEntity branch = branchRepository.findById(tableDTO.getBranchId()).orElseThrow(
				() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + tableDTO.getBranchId()));

		TableEntity tableEntity = TableMapper.toEntity(tableDTO);
        // Bàn mới tạo luôn có trạng thái AVAILABLE
        tableEntity.setStatus(TableStatus.AVAILABLE);
		tableEntity.setBranch(branch);
        if (tableEntity.getCreatedBy() == null) tableEntity.setCreatedBy("system");

		TableEntity savedTable = tableRepository.save(tableEntity);
		
		// Ghi lịch sử tạo bàn
		TableHistoryEntity history = new TableHistoryEntity();
		history.setTable(savedTable);
		history.setAction("CREATED");
		history.setNotes("Tạo bàn mới: " + savedTable.getName());
		tableHistoryRepository.save(history);
		
		// Load lại table với branch để tránh LazyInitializationException
		TableEntity tableWithBranch = tableRepository.findByIdWithBranch(savedTable.getId())
				.orElse(savedTable);
		
		return TableMapper.toResponseDto(tableWithBranch);
	}

	@Transactional
	public TableResponseDTO updateTable(Long id, TableRequestDTO tableDTO) {
		TableEntity existingTable = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));

		if (!existingTable.getName().equals(tableDTO.getName())) {
			tableRepository.findByName(tableDTO.getName()).ifPresent(t -> {
				if (!t.getId().equals(id)) {
					throw new IllegalArgumentException("Tên bàn '" + tableDTO.getName() + "' đã tồn tại.");
				}
			});
		}

        TableMapper.updateEntityFromDto(tableDTO, existingTable);
        if (existingTable.getStatus() == null) existingTable.setStatus(TableStatus.AVAILABLE);
		TableEntity updatedTable = tableRepository.save(existingTable);
		
		// Load lại table với branch để tránh LazyInitializationException
		TableEntity tableWithBranch = tableRepository.findByIdWithBranch(updatedTable.getId())
				.orElse(updatedTable);
		
		return TableMapper.toResponseDto(tableWithBranch);
	}

	@Transactional
	public void deleteTable(Long id) {
		TableEntity tableToDelete = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));

		if (tableToDelete.getStatus() == TableStatus.OCCUPIED) {
			throw new IllegalStateException("Không thể xóa bàn đang có khách ngồi.");
		}

		// Xóa table history trước khi xóa table
		tableHistoryRepository.deleteByTableId(id);
		
		// Sau đó xóa table
		tableRepository.delete(tableToDelete);
	}

	@Transactional
	public TableResponseDTO updateTableStatus(Long id, TableStatus newStatus) {
		TableEntity table = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));

		// Bạn có thể thêm các quy tắc nghiệp vụ ở đây nếu cần
		// Ví dụ: không cho đổi bàn đang có đơn hàng (OCCUPIED) thành TRỐNG (AVAILABLE)
		// một cách tùy tiện
		if (table.getStatus() == TableStatus.OCCUPIED && newStatus == TableStatus.AVAILABLE) {
			// Kiểm tra xem bàn này còn đơn hàng nào chưa thanh toán không
			// (Cần thêm logic vào OrderRepository)
			boolean hasUnpaidOrders = orderRepository.existsByTableAndStatusNot(table, OrderStatus.COMPLETED);
			if (hasUnpaidOrders) {
				throw new IllegalStateException("Không thể giải phóng bàn khi còn đơn hàng chưa thanh toán.");
			}
		}

		table.setStatus(newStatus);
		TableEntity updatedTable = tableRepository.save(table);
		
		// Load lại table với branch để tránh LazyInitializationException
		TableEntity tableWithBranch = tableRepository.findByIdWithBranch(updatedTable.getId())
				.orElse(updatedTable);
		
		return TableMapper.toResponseDto(tableWithBranch);
	}

	@Transactional(readOnly = true)
	public boolean tableBelongsToBranch(Long id, Long branchId) {
		return tableRepository.findByIdWithBranch(id)
				.map(t -> t.getBranch() != null && t.getBranch().getId().equals(branchId))
				.orElse(false);
	}

	@Transactional
	public TableResponseDTO setOperational(Long id, boolean active) {
		TableEntity table = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));
		// operationalStatus đã bị xóa, không còn cần thiết
		TableEntity updated = tableRepository.save(table);
		
		// Load lại table với branch để tránh LazyInitializationException
		TableEntity tableWithBranch = tableRepository.findByIdWithBranch(updated.getId())
				.orElse(updated);
		
		return TableMapper.toResponseDto(tableWithBranch);
	}

	@Transactional(readOnly = true)
	public Map<String, Object> getDeletability(Long id) {
		TableEntity table = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));

		boolean occupied = table.getStatus() == TableStatus.OCCUPIED;
		boolean hasUnpaidOrders = false;
		try {
			hasUnpaidOrders = orderRepository.existsByTableAndStatusNot(table, OrderStatus.COMPLETED);
		} catch (Exception ignored) {}

		java.util.List<java.util.Map<String, Object>> reasons = new java.util.ArrayList<>();
		if (occupied) reasons.add(java.util.Map.of("type", "OCCUPIED", "count", 1));
		if (hasUnpaidOrders) reasons.add(java.util.Map.of("type", "ORDER", "count", 1));

		return java.util.Map.of(
				"deletable", !(occupied || hasUnpaidOrders),
				"reasons", reasons
		);
	}

	// ========== CÁC METHOD MỚI CHO NGHIỆP VỤ HOÀN THIỆN ==========

	@Transactional
	public TableResponseDTO updateTableStatus(Long id, TableStatus newStatus, String notes) {
		TableEntity table = tableRepository.findByIdWithBranch(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bàn với ID: " + id));

		TableStatus oldStatus = table.getStatus();
		table.setStatus(newStatus);
		TableEntity updatedTable = tableRepository.save(table);

		// Ghi lịch sử thay đổi trạng thái
		TableHistoryEntity history = new TableHistoryEntity();
		history.setTable(updatedTable);
		history.setAction(newStatus.name());
		history.setNotes("Thay đổi trạng thái từ " + oldStatus + " sang " + newStatus + ". " + (notes != null ? notes : ""));
		tableHistoryRepository.save(history);

		// Load lại table với branch để tránh LazyInitializationException
		TableEntity tableWithBranch = tableRepository.findByIdWithBranch(updatedTable.getId())
				.orElse(updatedTable);

		return TableMapper.toResponseDto(tableWithBranch);
	}

	@Transactional(readOnly = true)
	public List<TableHistoryDTO> getTableHistory(Long tableId) {
		return tableHistoryRepository.findByTableIdOrderByCreatedAtDescWithTable(tableId)
				.stream()
				.map(this::mapToHistoryDTO)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TableHistoryDTO> getTableHistoryByBranch(Long branchId) {
		return tableHistoryRepository.findByBranchIdWithTable(branchId)
				.stream()
				.map(this::mapToHistoryDTO)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TableResponseDTO> getAvailableTablesByCapacity(Long branchId, Integer minCapacity) {
		return tableRepository.findByBranchIdWithBranch(branchId).stream()
				.filter(t -> t.getStatus() == TableStatus.AVAILABLE && t.getSeats() >= minCapacity)
				.map(TableMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TableResponseDTO> getAvailableTables() {
		return tableRepository.findAllWithBranch().stream()
				.filter(t -> t.getStatus() == TableStatus.AVAILABLE)
				.map(TableMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TableResponseDTO> getAvailableTablesByBranch(Long branchId) {
		return tableRepository.findByBranchIdWithBranch(branchId).stream()
				.filter(t -> t.getStatus() == TableStatus.AVAILABLE)
				.map(TableMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<TableResponseDTO> getVipTables(Long branchId) {
		return tableRepository.findByBranchIdWithBranch(branchId).stream()
				.filter(TableEntity::getIsVip)
				.map(TableMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public Map<String, Object> getTableStatistics(Long branchId) {
		List<TableEntity> tables = tableRepository.findByBranchIdWithBranch(branchId);
		
		long totalTables = tables.size();
		long availableTables = tables.stream().filter(t -> t.getStatus() == TableStatus.AVAILABLE).count();
		long occupiedTables = tables.stream().filter(t -> t.getStatus() == TableStatus.OCCUPIED).count();
		long vipTables = tables.stream().filter(TableEntity::getIsVip).count();
		
		double utilizationRate = totalTables > 0 ? (double) occupiedTables / totalTables * 100 : 0;
		
		return Map.of(
			"totalTables", totalTables,
			"availableTables", availableTables,
			"occupiedTables", occupiedTables,
			"vipTables", vipTables,
			"utilizationRate", Math.round(utilizationRate * 100.0) / 100.0
		);
	}
	
	@Transactional(readOnly = true)
	public List<String> getDistinctAreas() {
		return tableRepository.findDistinctAreas();
	}
	
	@Transactional(readOnly = true)
	public List<String> getDistinctAreasByBranch(Long branchId) {
		return tableRepository.findDistinctAreasByBranch(branchId);
	}

	private TableHistoryDTO mapToHistoryDTO(TableHistoryEntity entity) {
		TableHistoryDTO dto = new TableHistoryDTO();
		dto.setId(entity.getId());
		
		// Xử lý table với try-catch để tránh LazyInitializationException
		if (entity.getTable() != null) {
			try {
				dto.setTableId(entity.getTable().getId());
				dto.setTableName(entity.getTable().getName());
			} catch (Exception e) {
				dto.setTableId(null);
				dto.setTableName("Unknown Table");
			}
		} else {
			dto.setTableId(null);
			dto.setTableName("Unknown Table");
		}
		
		dto.setAction(entity.getAction());
		dto.setNotes(entity.getNotes());
		dto.setCreatedAt(entity.getCreatedAt().toString());
		
		// Xử lý user với try-catch
		if (entity.getUser() != null) {
			try {
				dto.setUserId(entity.getUser().getId());
				dto.setUserName(entity.getUser().getUsername());
			} catch (Exception e) {
				dto.setUserId(null);
				dto.setUserName("Unknown User");
			}
		}
		
		// Xử lý order với try-catch
		if (entity.getOrder() != null) {
			try {
				dto.setOrderId(entity.getOrder().getId());
			} catch (Exception e) {
				dto.setOrderId(null);
			}
		}
		
		// Xử lý reservation với try-catch
		if (entity.getReservation() != null) {
			try {
				dto.setReservationId(entity.getReservation().getId());
			} catch (Exception e) {
				dto.setReservationId(null);
			}
		}
		
		return dto;
	}
}