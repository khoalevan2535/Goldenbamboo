package com.poly.restaurant.services;

import com.poly.restaurant.dtos.CategoryRequestDTO;
import com.poly.restaurant.dtos.CategoryResponseDTO;
import com.poly.restaurant.entities.CategoryEntity;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.enums.CategoryStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.CategoryMapper;
import com.poly.restaurant.repositories.CategoryRepository;
import com.poly.restaurant.repositories.DishRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {
	private static final Logger logger = LoggerFactory.getLogger(CategoryService.class);

	private final CategoryRepository categoryRepository;
	private final DishRepository dishRepository;

	@Transactional(readOnly = true)
	public Page<CategoryResponseDTO> searchCategories(String name, String status, Long branchId, int page, int size) {
		Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

		Specification<CategoryEntity> spec = Specification.where(null);

		if (name != null && !name.trim().isEmpty()) {
			spec = spec.and((root, query, cb) -> cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
		}

		// operationalStatus đã bị xóa, không còn filter theo status

		if (branchId != null) {
			spec = spec.and((root, query, cb) -> cb.equal(root.get("branch").get("id"), branchId));
		}

		Page<CategoryEntity> categoryPage = categoryRepository.findAll(spec, pageable);
		return categoryPage.map(c -> {
			CategoryResponseDTO dto = CategoryMapper.toResponseDto(c);
			try {
				long dishCount = dishRepository.countByCategoryId(c.getId());
				dto.setInUse(dishCount > 0);
			} catch (Exception ignored) {
			}
			return dto;
		});
	}

	@Transactional(readOnly = true)
	public CategoryResponseDTO getCategoryById(Long id) {
		CategoryEntity category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));
		return CategoryMapper.toResponseDto(category);
	}

	@Transactional
	public CategoryResponseDTO createCategory(CategoryRequestDTO categoryRequestDTO, AccountEntity loggedInUser) {
		logger.info("User '{}' is creating a new category with name '{}'", loggedInUser.getUsername(),
				categoryRequestDTO.getName());
		categoryRepository.findByName(categoryRequestDTO.getName()).ifPresent(c -> {
			throw new IllegalArgumentException(
					"Tên danh mục '" + categoryRequestDTO.getName() + "' đã tồn tại.");
		});

		CategoryEntity categoryEntity = CategoryMapper.toEntity(categoryRequestDTO);

		// Tự động lấy branch từ loggedInUser
		BranchEntity branch = loggedInUser.getBranch();
		if (branch == null) {
			throw new IllegalArgumentException("Người dùng chưa được gán cho chi nhánh nào");
		}
		categoryEntity.setBranch(branch);

		CategoryEntity savedCategory = categoryRepository.save(categoryEntity);
		return CategoryMapper.toResponseDto(savedCategory);
	}

	@Transactional(readOnly = true)
	public Page<CategoryResponseDTO> searchCategoriesForManager(String name, String status, AccountEntity loggedInUser, int page, int size) {
		// Tự động lấy branchId từ loggedInUser
		Long branchId = loggedInUser.getBranch() != null ? loggedInUser.getBranch().getId() : null;
		return searchCategories(name, status, branchId, page, size);
	}

	@Transactional
	public CategoryResponseDTO updateCategory(Long id, CategoryRequestDTO categoryRequestDTO,
			AccountEntity loggedInUser) {
		CategoryEntity existingCategory = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

		logger.info("User '{}' is updating category with id '{}'", loggedInUser.getUsername(), id);

		// Kiểm tra quyền cập nhật
		boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
		if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(existingCategory.getBranch().getId()))) {
			throw new SecurityException("Bạn không có quyền cập nhật danh mục này.");
		}

		// Kiểm tra tên danh mục đã tồn tại chưa (ngoại trừ chính nó)
		categoryRepository.findByName(categoryRequestDTO.getName()).ifPresent(c -> {
			if (!c.getId().equals(id)) {
				throw new IllegalArgumentException(
						"Tên danh mục '" + categoryRequestDTO.getName() + "' đã tồn tại.");
			}
		});

		CategoryMapper.updateEntityFromDto(categoryRequestDTO, existingCategory);
		CategoryEntity updatedCategory = categoryRepository.save(existingCategory);
		return CategoryMapper.toResponseDto(updatedCategory);
	}

	// Method updateCategoryOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

	// Method updateOperationalStatus đã bị xóa vì operationalStatus không còn tồn tại

	@Transactional
	public void deleteCategory(Long id, AccountEntity loggedInUser) {
		CategoryEntity category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

		logger.warn("User '{}' is deleting category with id '{}'", loggedInUser.getUsername(), id);

		// Kiểm tra quyền xóa
		boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
		if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(category.getBranch().getId()))) {
			throw new SecurityException("Bạn không có quyền xóa danh mục này.");
		}

		// Kiểm tra xem có món ăn nào đang sử dụng danh mục này không
		if (dishRepository.existsByCategoryId(id)) {
			throw new DataIntegrityViolationException("Không thể xóa danh mục này vì vẫn còn món ăn thuộc về nó.");
		}

		categoryRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public Map<String, Object> getDeletability(Long id) {
		categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy danh mục với ID: " + id));

		long dishCount = dishRepository.countByCategoryId(id);
		boolean deletable = dishCount == 0;

		return Map.of(
				"deletable", deletable,
				"reasons", dishCount == 0 ? List.of()
						: List.of(
								Map.of("type", "DISH", "count", dishCount)));
	}

	/**
	 * Debug method to get all categories without filtering
	 */
	@Transactional(readOnly = true)
	public List<CategoryEntity> getAllCategoriesForDebug() {
		return categoryRepository.findAll();
	}

	/**
	 * Cập nhật trạng thái category
	 */
	@Transactional
	public CategoryResponseDTO updateCategoryStatus(Long id, CategoryStatus status, AccountEntity loggedInUser) {
		CategoryEntity category = categoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy category với ID: " + id));

		// Kiểm tra quyền cập nhật
		boolean isAdmin = loggedInUser.getRole() != null && "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
		if (!isAdmin && (loggedInUser.getBranch() == null || !loggedInUser.getBranch().getId().equals(category.getBranch().getId()))) {
			throw new SecurityException("Bạn không có quyền cập nhật category này.");
		}

		category.setStatus(status);
		CategoryEntity updatedCategory = categoryRepository.save(category);
		return CategoryMapper.toResponseDto(updatedCategory);
	}
}