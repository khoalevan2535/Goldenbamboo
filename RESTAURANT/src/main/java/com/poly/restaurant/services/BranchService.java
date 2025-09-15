package com.poly.restaurant.services;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poly.restaurant.dtos.BranchRequestDTO;
import com.poly.restaurant.dtos.BranchResponseDTO;
import com.poly.restaurant.dtos.UpdateBranchStatusRequestDTO;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.enums.BranchStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;

import com.poly.restaurant.mappers.BranchMapper;

import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.OrderRepository;

import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BranchService {

	private final BranchRepository branchRepository;

	private final AccountRepository accountRepository;
	private final OrderRepository orderRepository;

	/**
	 * Lấy danh sách tất cả chi nhánh
	 */
	public List<BranchResponseDTO> getAllBranches() {
		return branchRepository.findAll().stream().map(branch -> {
			BranchResponseDTO dto = BranchMapper.toResponseDto(branch);
			// Thêm thông tin isInUse
			dto.setIsInUse(isBranchInUse(branch.getId()));
			return dto;
		}).collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đang mở cửa (OPEN)
	 */
	public List<BranchResponseDTO> getOpenBranches() {
		return branchRepository.findByStatus(BranchStatus.OPEN)
				.stream()
				.map(BranchMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đang hoạt động (cho giao hàng)
	 */
	public List<BranchResponseDTO> getActiveBranches() {
		return branchRepository.findByStatus(BranchStatus.OPEN)
				.stream()
				.map(BranchMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách tất cả chi nhánh dừng hoạt động (INACTIVE)
	 */
	public List<BranchResponseDTO> getInactiveBranches() {
		return branchRepository.findByStatus(BranchStatus.INACTIVE)
				.stream()
				.map(BranchMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đang bảo trì (MAINTENANCE)
	 */
	public List<BranchResponseDTO> getMaintenanceBranches() {
		return branchRepository.findByStatus(BranchStatus.MAINTENANCE)
				.stream()
				.map(BranchMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách tất cả chi nhánh đóng cửa vĩnh viễn (CLOSED)
	 */
	public List<BranchResponseDTO> getClosedBranches() {
		return branchRepository.findByStatus(BranchStatus.CLOSED)
				.stream()
				.map(BranchMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách chi nhánh cho form địa chỉ giao hàng (chỉ lấy chi nhánh đang mở cửa)
	 */
	public List<BranchResponseDTO> getBranchesForDelivery() {
		return branchRepository.findByStatus(BranchStatus.OPEN)
				.stream()
				.map(BranchMapper::toResponseDto)
				.collect(Collectors.toList());
	}

	/**
	 * Lấy danh sách chi nhánh với phân trang và tìm kiếm
	 */
	public Page<BranchResponseDTO> getAllBranchesWithPagination(Pageable pageable, String name, String status) {
		Specification<BranchEntity> spec = Specification.where(null);

		// Thêm điều kiện tìm kiếm theo tên
		if (name != null && !name.trim().isEmpty()) {
			spec = spec
					.and((root, query, criteriaBuilder) -> criteriaBuilder.like(criteriaBuilder.lower(root.get("name")),
							"%" + name.toLowerCase() + "%"));
		}

		// Thêm điều kiện lọc theo trạng thái
		if (status != null && !status.trim().isEmpty()) {
			spec = spec.and((root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("status"), status));
		}

		Page<BranchEntity> branchPage = branchRepository.findAll(spec, pageable);
		return branchPage.map(branch -> {
			BranchResponseDTO dto = BranchMapper.toResponseDto(branch);
			// Thêm thông tin isInUse
			dto.setIsInUse(isBranchInUse(branch.getId()));
			return dto;
		});
	}

	/**
	 * Lấy thông tin chi tiết một chi nhánh theo ID
	 */
	public BranchResponseDTO getBranchById(Long id) {
		BranchEntity branch = branchRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));
		return BranchMapper.toResponseDto(branch);
	}

	/**
	 * Tạo một chi nhánh mới
	 */
	@Transactional
	public BranchResponseDTO createBranch(BranchRequestDTO requestDTO) {
		// Kiểm tra xem tên chi nhánh đã tồn tại chưa

		BranchEntity branch = BranchMapper.toEntity(requestDTO);
		double[] latLng = getLatLngFromAddress(requestDTO.getAddress());
		branch.setLatitude(latLng[0]);
		branch.setLongitude(latLng[1]);
		BranchEntity savedBranch = branchRepository.save(branch);
		return BranchMapper.toResponseDto(savedBranch);
	}

	/**
	 * Cập nhật thông tin một chi nhánh
	 */
	@Transactional
	public BranchResponseDTO updateBranch(Long id, BranchRequestDTO requestDTO) {
		BranchEntity existingBranch = branchRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));

		// Dùng mapper để cập nhật các trường từ DTO vào entity đã có
		BranchMapper.updateEntityFromDto(requestDTO, existingBranch);

		BranchEntity updatedBranch = branchRepository.save(existingBranch);
		return BranchMapper.toResponseDto(updatedBranch);
	}

	/**
	 * Xóa một chi nhánh
	 */
	@Transactional
	public void deleteBranch(Long id) {
		if (!branchRepository.existsById(id)) {
			throw new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id);
		}
		branchRepository.deleteById(id);
	}

	@Transactional
	public BranchResponseDTO updateBranchStatus(Long id, UpdateBranchStatusRequestDTO request) {
		// Tìm chi nhánh theo ID
		BranchEntity branch = branchRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));

		// Cập nhật trạng thái mới
		branch.setStatus(request.getStatus());

		// Lưu lại và trả về kết quả
		BranchEntity updatedBranch = branchRepository.save(branch);
		return BranchMapper.toResponseDto(updatedBranch);
	}

	@Transactional
	public BranchResponseDTO updateBranchLocation(Long id, Map<String, Object> request) {
		// Tìm chi nhánh theo ID
		BranchEntity branch = branchRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh với ID: " + id));

		// Cập nhật thông tin địa chỉ
		if (request.containsKey("province")) {
			branch.setProvince((String) request.get("province"));
		}
		if (request.containsKey("district")) {
			branch.setDistrict((String) request.get("district"));
		}
		if (request.containsKey("ward")) {
			branch.setWard((String) request.get("ward"));
		}
		if (request.containsKey("latitude")) {
			branch.setLatitude(((Number) request.get("latitude")).doubleValue());
		}
		if (request.containsKey("longitude")) {
			branch.setLongitude(((Number) request.get("longitude")).doubleValue());
		}

		// Lưu lại và trả về kết quả
		BranchEntity updatedBranch = branchRepository.save(branch);
		return BranchMapper.toResponseDto(updatedBranch);
	}

	private double[] getLatLngFromAddress(String address) {
		String url = "https://nominatim.openstreetmap.org/search?format=json&q=" + address.replace(" ", "+");
		RestTemplate restTemplate = new RestTemplate();
		String response = restTemplate.getForObject(url, String.class);
		JSONArray results = new JSONArray(response);
		if (results.length() > 0) {
			JSONObject location = results.getJSONObject(0);
			double lat = Double.parseDouble(location.getString("lat"));
			double lon = Double.parseDouble(location.getString("lon"));
			return new double[] { lat, lon };
		}
		throw new RuntimeException("Không lấy được vị trí từ địa chỉ");
	}


	/**
	 * Kiểm tra xem chi nhánh có đang được sử dụng không
	 * @param branchId ID của chi nhánh
	 * @return true nếu chi nhánh đang được sử dụng (có account hoặc order liên kết)
	 */
	public boolean isBranchInUse(Long branchId) {
		// Kiểm tra có account nào đang sử dụng chi nhánh này không
		Long accountCount = accountRepository.countByBranchId(branchId);
		if (accountCount > 0) {
			return true;
		}
		
		// Kiểm tra có order nào liên kết với chi nhánh này không
		Long orderCount = orderRepository.countByBranchId(branchId);
		if (orderCount > 0) {
			return true;
		}
		
		return false;
	}
}