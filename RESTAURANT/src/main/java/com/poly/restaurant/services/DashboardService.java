package com.poly.restaurant.services;

import com.poly.restaurant.dtos.DashboardStatsDTO;
import com.poly.restaurant.repositories.*;
import com.poly.restaurant.entities.enums.ReservationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.Arrays;

@Service
@RequiredArgsConstructor
public class DashboardService {

	private final BranchRepository branchRepository;
	private final AccountRepository accountRepository;
	private final DishRepository dishRepository;
	private final ComboRepository comboRepository;
	private final OrderRepository orderRepository;
	// Bỏ approval system
	private final ReservationRepository reservationRepository;

	public DashboardStatsDTO getDashboardStats(Long branchId, LocalDate startDate, LocalDate endDate) {
		LocalDateTime startOfDay = startDate.atStartOfDay();
		LocalDateTime endOfDay = endDate.atTime(LocalTime.MAX);

		// Thống kê cơ bản
		Long totalBranches = branchRepository.count();
		Long totalUsers = accountRepository.count();
		// Tạm thời set totalStaff = 0 để tránh lỗi
		Long totalStaff = 0L;
		Long totalDishes = dishRepository.count();
		Long totalCombos = comboRepository.count();
		Long totalOrders = orderRepository.count();
		
		// Debug log
		System.out.println("🔍 Dashboard Stats Debug:");
		System.out.println("Total Branches: " + totalBranches);
		System.out.println("Total Users: " + totalUsers);
		System.out.println("Total Staff: " + totalStaff);
		System.out.println("Total Dishes: " + totalDishes);
		System.out.println("Total Combos: " + totalCombos);
		System.out.println("Total Orders: " + totalOrders);

		// Thống kê đơn hàng hôm nay
		Long todayOrders = orderRepository.countByCreatedAtBetween(startOfDay, endOfDay);

		// Bỏ approval system - không cần thống kê phê duyệt
		Long pendingApprovals = 0L;

		// Thống kê đặt bàn hôm nay (CONFIRMED)
		Long activeReservations = reservationRepository.countByReservationTimeBetweenAndStatusIn(startOfDay, endOfDay,
				Arrays.asList(ReservationStatus.CONFIRMED));

		// Thống kê doanh thu tháng
		BigDecimal monthlyRevenue = orderRepository.getMonthlyRevenue(startDate.getYear(), startDate.getMonthValue());

		DashboardStatsDTO stats = new DashboardStatsDTO();
		// TODO: Add missing fields to DashboardStatsDTO
		// stats.setTotalBranches(totalBranches);
		// stats.setTotalUsers(totalUsers);
		// stats.setTotalStaff(totalStaff);
		// stats.setTotalDishes(totalDishes);
		// stats.setTotalCombos(totalCombos);
		// stats.setTotalOrders(totalOrders);
		// stats.setPendingApprovals(pendingApprovals);
		// stats.setActiveReservations(activeReservations);
		stats.setTodayOrders(todayOrders);
		// stats.setMonthlyRevenue(monthlyRevenue);

		return stats;
	}

	// Method đơn giản - không cần tham số, không giới hạn chi nhánh
	public DashboardStatsDTO getSimpleDashboardStats() {
		try {
			// Lấy tất cả dữ liệu toàn hệ thống (không giới hạn chi nhánh)
			Long totalBranches = branchRepository.count();
			Long totalUsers = accountRepository.count();
			Long totalStaff = 0L; // Tạm thời set 0
			Long totalOrders = orderRepository.count();
			Long totalDishes = dishRepository.count();
			Long totalCombos = comboRepository.count();
			
			DashboardStatsDTO stats = new DashboardStatsDTO();
			// TODO: Add missing fields to DashboardStatsDTO
			// stats.setTotalBranches(totalBranches);
			// stats.setTotalUsers(totalUsers);
			// stats.setTotalStaff(totalStaff);
			// stats.setTotalOrders(totalOrders);
			// stats.setTotalDishes(totalDishes);
			// stats.setTotalCombos(totalCombos);
			// stats.setPendingApprovals(0L);
			// stats.setActiveReservations(0L);
			stats.setTodayOrders(0L);
			// stats.setMonthlyRevenue(BigDecimal.ZERO);
			
			return stats;
		} catch (Exception e) {
			System.out.println("❌ Error getting simple dashboard stats: " + e.getMessage());
			return new DashboardStatsDTO();
		}
	}

	// Các method tối ưu - chỉ lấy số lượng
	public Long getTotalUsersCount() {
		try {
			return accountRepository.count();
		} catch (Exception e) {
			System.out.println("❌ Error getting total users count: " + e.getMessage());
			return 0L;
		}
	}

	public Long getTotalBranchesCount() {
		try {
			return branchRepository.count();
		} catch (Exception e) {
			System.out.println("❌ Error getting total branches count: " + e.getMessage());
			return 0L;
		}
	}

	public Long getTotalStaffCount() {
		try {
			// Đếm số nhân viên (STAFF và MANAGER)
			return accountRepository.countByRoleIn(Arrays.asList("ROLE_STAFF", "ROLE_MANAGER"));
		} catch (Exception e) {
			System.out.println("❌ Error getting total staff count: " + e.getMessage());
			return 0L;
		}
	}

	public Long getTotalOrdersCount() {
		try {
			return orderRepository.count();
		} catch (Exception e) {
			System.out.println("❌ Error getting total orders count: " + e.getMessage());
			return 0L;
		}
	}
}
