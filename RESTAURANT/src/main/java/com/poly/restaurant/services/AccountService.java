package com.poly.restaurant.services;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.poly.restaurant.dtos.AccountRequestDTO;
import com.poly.restaurant.dtos.AccountResponseDTO;
import com.poly.restaurant.dtos.AuthResponseDTO;
import com.poly.restaurant.dtos.LoginRequestDTO;
import com.poly.restaurant.dtos.RefreshTokenRequestDTO;
import com.poly.restaurant.dtos.PhoneRegistrationRequestDTO;
import com.poly.restaurant.dtos.RegisterOtpRequestDTO;
import com.poly.restaurant.dtos.StaffRegistrationRequestDTO;
import com.poly.restaurant.dtos.StaffUpdateRequestDTO;
import com.poly.restaurant.dtos.UpdateAccountRoleRequestDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.BranchEntity;
import com.poly.restaurant.entities.RoleEntity;
import com.poly.restaurant.entities.enums.AccountStatus;
import com.poly.restaurant.exceptions.ResourceNotFoundException;
import com.poly.restaurant.mappers.AccountMapper;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.BranchRepository;
import com.poly.restaurant.repositories.RoleRepository;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;
import io.jsonwebtoken.Claims;

@Service
@RequiredArgsConstructor
public class AccountService {

	private static final Logger logger = LoggerFactory.getLogger(AccountService.class);

	@Value("${application.security.jwt.refresh-token.expiration}")
	private long refreshTokenExpiration;

	private final AccountRepository accountRepository;
	private final RoleRepository roleRepository;
	private final BranchRepository branchRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final AuthenticationManager authenticationManager;
	private final EmailService emailService; // thêm vào để gửi OTP
	private final TempRegistrationService tempRegistrationService; // thêm service quản lý đăng ký tạm thời
	private final SpeedSmsService speedSmsService; // thêm service gửi SMS

	/**
	 * Đăng nhập: trả về accessToken và refreshToken
	 */
	public AuthResponseDTO login(LoginRequestDTO request) {
		logger.info("Attempting login with identifier: {}", request.getLoginIdentifier());

		try {
			// Tìm tài khoản trước khi xác thực
			AccountEntity account = findAccountByIdentifier(request.getLoginIdentifier());
			
			// Kiểm tra tài khoản có bị khóa tạm thời không
			if (isAccountTemporarilyLocked(account)) {
				long remainingMinutes = getRemainingLockTime(account);
				throw new IllegalStateException(
					String.format("Tài khoản đã bị tạm khóa. Vui lòng thử lại sau %d phút.", remainingMinutes)
				);
			}
			
			// Kiểm tra trạng thái tài khoản
			if (account.getStatus() == AccountStatus.INACTIVE) {
				logger.warn("Login attempt for inactive account: {}", account.getEmail());
				throw new IllegalStateException("Tài khoản đã bị tạm khóa.");
			}
			
			if (account.getStatus() == AccountStatus.LOCKED) {
				logger.warn("Login attempt for permanently locked account: {}", account.getEmail());
				throw new IllegalStateException("Tài khoản đã bị khóa vĩnh viễn.");
			}

			// Thực hiện xác thực
			Authentication authentication = authenticationManager.authenticate(
					new UsernamePasswordAuthenticationToken(request.getLoginIdentifier(), request.getPassword()));
			var user = (AccountEntity) authentication.getPrincipal();

			// Đăng nhập thành công - reset số lần thất bại
			resetFailedAttempts(user);

			var accessToken = jwtService.generateToken(user);
			var refreshToken = jwtService.generateRefreshToken(user);

			user.setRefreshToken(refreshToken);
			user.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpiration)));
			accountRepository.save(user);

			return AuthResponseDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
		} catch (Exception e) {
			// Xử lý đăng nhập thất bại
			handleFailedLogin(request.getLoginIdentifier());
			logger.error("Login failed for identifier: {}, error: {}", request.getLoginIdentifier(), e.getMessage());
			throw e;
		}
	}

	/**
	 * Tìm tài khoản theo email hoặc username
	 */
	private AccountEntity findAccountByIdentifier(String identifier) {
		return accountRepository.findByEmailOrUsername(identifier, identifier)
				.orElseThrow(() -> new IllegalStateException("Tài khoản không tồn tại."));
	}

	/**
	 * Kiểm tra tài khoản có bị khóa tạm thời không
	 */
	private boolean isAccountTemporarilyLocked(AccountEntity account) {
		if (account.getLockTime() == null) {
			return false;
		}
		
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime lockExpiry = account.getLockTime().plusHours(1); // Khóa 1 giờ
		
		return now.isBefore(lockExpiry);
	}

	/**
	 * Lấy thời gian còn lại của khóa (phút)
	 */
	private long getRemainingLockTime(AccountEntity account) {
		if (account.getLockTime() == null) {
			return 0;
		}
		
		LocalDateTime now = LocalDateTime.now();
		LocalDateTime lockExpiry = account.getLockTime().plusHours(1);
		
		if (now.isAfter(lockExpiry)) {
			return 0;
		}
		
		return Duration.between(now, lockExpiry).toMinutes();
	}

	/**
	 * Xử lý đăng nhập thất bại
	 */
	private void handleFailedLogin(String identifier) {
		try {
			AccountEntity account = findAccountByIdentifier(identifier);
			
			// Tăng số lần thất bại
			int currentFailedAttempts = account.getFailedAttempts() != null ? account.getFailedAttempts() : 0;
			account.setFailedAttempts(currentFailedAttempts + 1);
			account.setLastFailedAttempt(LocalDateTime.now());
			
			// Kiểm tra nếu đã thất bại 5 lần
			if (currentFailedAttempts + 1 >= 5) {
				account.setLockTime(LocalDateTime.now());
				account.setStatus(AccountStatus.INACTIVE);
				logger.warn("Account locked due to 5 failed attempts: {}", identifier);
			}
			
			accountRepository.save(account);
		} catch (Exception e) {
			logger.error("Error handling failed login for identifier: {}", identifier, e);
		}
	}

	/**
	 * Reset số lần thất bại khi đăng nhập thành công
	 */
	private void resetFailedAttempts(AccountEntity account) {
		account.setFailedAttempts(0);
		account.setLockTime(null);
		account.setLastFailedAttempt(null);
		
		// Nếu tài khoản đang bị khóa tạm thời, mở khóa
		if (account.getStatus() == AccountStatus.INACTIVE && account.getLockTime() != null) {
			account.setStatus(AccountStatus.ACTIVE);
		}
		
		accountRepository.save(account);
	}

	/**
	 * Lấy thông tin về số lần thất bại còn lại
	 */
	public String getFailedAttemptsInfo(String identifier) {
		try {
			AccountEntity account = findAccountByIdentifier(identifier);
			int failedAttempts = account.getFailedAttempts() != null ? account.getFailedAttempts() : 0;
			int remainingAttempts = 5 - failedAttempts;
			
			if (remainingAttempts <= 0) {
				return "Tài khoản đã bị khóa do nhập sai mật khẩu 5 lần. Vui lòng thử lại sau 1 giờ.";
			}
			
			return String.format("Còn %d lần thử đăng nhập. Nếu nhập sai quá 5 lần sẽ bị khóa 1 giờ.", remainingAttempts);
		} catch (Exception e) {
			return "Không thể xác định thông tin tài khoản.";
		}
	}




	/**
	 * Đăng ký nhân viên (chỉ Admin/Manager gọi)
	 */
	@Transactional
	public AuthResponseDTO registerStaff(StaffRegistrationRequestDTO request, AccountEntity loggedInUser) {
		if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
			throw new IllegalStateException("Username đã được sử dụng.");
		}

		// Kiểm tra email trùng lặp nếu có email
		if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
			if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
				throw new IllegalStateException("Email đã được sử dụng. Vui lòng chọn email khác.");
			}
		}

		boolean isAdminCreating = loggedInUser.getRole() != null
				&& "ROLE_ADMIN".equals(loggedInUser.getRole().getName());
		boolean isManagerCreating = loggedInUser.getRole() != null
				&& "ROLE_MANAGER".equals(loggedInUser.getRole().getName());

		if (isManagerCreating && !request.getRoleName().equals("ROLE_STAFF")) {
			throw new IllegalStateException("Manager chỉ có quyền tạo tài khoản Staff.");
		}

		RoleEntity role = roleRepository.findByName(request.getRoleName())
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò: " + request.getRoleName()));

		BranchEntity branch;
		if (isManagerCreating) {
			branch = loggedInUser.getBranch();
			if (branch == null) {
				throw new IllegalStateException("Manager phải thuộc về một chi nhánh.");
			}
		} else {
			branch = (request.getBranchId() != null) ? branchRepository.findById(request.getBranchId())
					.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh.")) : null;
		}

		AccountEntity account = new AccountEntity();
		account.setUsername(request.getUsername());
		account.setName(request.getName());
		account.setPhone(request.getPhone());
		account.setEmail(request.getEmail()); // Thêm email
		
		// Nếu có email, tài khoản sẽ ở trạng thái INACTIVE và cần kích hoạt
		// Nếu không có email, sử dụng mật khẩu được cung cấp
		if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
			// Tạo mật khẩu tạm thời cho tài khoản cần kích hoạt
			account.setPassword(passwordEncoder.encode("TEMP_PASSWORD_" + System.currentTimeMillis()));
			account.setStatus(AccountStatus.INACTIVE); // Cần kích hoạt qua email
		} else {
			// Không có email, sử dụng mật khẩu được cung cấp
			if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
				account.setPassword(passwordEncoder.encode(request.getPassword()));
			} else {
				// Tạo mật khẩu mặc định nếu không có
				account.setPassword(passwordEncoder.encode("123456"));
			}
			account.setStatus(isAdminCreating ? AccountStatus.ACTIVE : AccountStatus.INACTIVE);
		}
		
		account.setBranch(branch);
		account.setRole(role);

		try {
			AccountEntity savedAccount = accountRepository.save(account);

			// Nếu có email, gửi email kích hoạt
			if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
				try {
					// Tạo activation token
					String activationToken = jwtService.generateActivationToken(savedAccount);
					
					// Lưu activation token vào account
					savedAccount.setActivationToken(activationToken);
					savedAccount.setActivationTokenExpiry(LocalDateTime.now().plusDays(7)); // 7 ngày
					accountRepository.save(savedAccount);
					
					// Gửi email kích hoạt
					emailService.sendStaffActivationEmail(savedAccount.getEmail(), savedAccount.getName(), activationToken);
					
					logger.info("Staff activation email sent to: {}", savedAccount.getEmail());
				} catch (Exception e) {
					logger.error("Failed to send activation email to: {}, error: {}", savedAccount.getEmail(), e.getMessage());
					// Không throw exception, chỉ log lỗi
				}
			}

			var accessToken = jwtService.generateToken(savedAccount);
			var refreshToken = jwtService.generateRefreshToken(savedAccount);

			savedAccount.setRefreshToken(refreshToken);
			savedAccount.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpiration)));
			accountRepository.save(savedAccount);

			return AuthResponseDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
		} catch (Exception e) {
			// Xử lý lỗi database constraint
			if (e.getMessage() != null && e.getMessage().contains("Duplicate entry")) {
				if (e.getMessage().contains("email")) {
					throw new IllegalStateException("Email đã được sử dụng. Vui lòng chọn email khác.");
				} else if (e.getMessage().contains("phone")) {
					throw new IllegalStateException("Số điện thoại đã được sử dụng. Vui lòng chọn số khác.");
				}
			}
			throw e; // Re-throw nếu không phải lỗi constraint
		}
	}

	/**
	 * Kích hoạt tài khoản nhân viên
	 */
	@Transactional
	public AuthResponseDTO activateStaffAccount(String activationToken, String newPassword) {
		try {
			// Xác thực activation token
			Claims claims = jwtService.extractAllClaims(activationToken);
			
			// Kiểm tra loại token
			String tokenType = claims.get("type", String.class);
			if (!"activation".equals(tokenType)) {
				throw new IllegalStateException("Token không hợp lệ.");
			}
			
			// Lấy thông tin từ token
			Long accountId = claims.get("accountId", Long.class);
			String email = claims.get("email", String.class);
			
			// Tìm tài khoản
			AccountEntity account = accountRepository.findById(accountId)
					.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));
			
			// Kiểm tra email khớp
			if (!email.equals(account.getEmail())) {
				throw new IllegalStateException("Token không hợp lệ.");
			}
			
			// Kiểm tra token đã được sử dụng chưa
			if (account.getActivationToken() == null || !account.getActivationToken().equals(activationToken)) {
				throw new IllegalStateException("Token đã được sử dụng hoặc không hợp lệ.");
			}
			
			// Kiểm tra token hết hạn
			if (account.getActivationTokenExpiry() != null && account.getActivationTokenExpiry().isBefore(LocalDateTime.now())) {
				throw new IllegalStateException("Token đã hết hạn. Vui lòng liên hệ quản lý để được cấp token mới.");
			}
			
			// Cập nhật mật khẩu và kích hoạt tài khoản
			account.setPassword(passwordEncoder.encode(newPassword));
			account.setStatus(AccountStatus.ACTIVE);
			account.setActivationToken(null); // Xóa token sau khi sử dụng
			account.setActivationTokenExpiry(null);
			
			AccountEntity savedAccount = accountRepository.save(account);
			
			// Tạo token đăng nhập
			var accessToken = jwtService.generateToken(savedAccount);
			var refreshToken = jwtService.generateRefreshToken(savedAccount);
			
			savedAccount.setRefreshToken(refreshToken);
			savedAccount.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpiration)));
			accountRepository.save(savedAccount);
			
			logger.info("Staff account activated successfully: {}", savedAccount.getEmail());
			
			return AuthResponseDTO.builder()
					.accessToken(accessToken)
					.refreshToken(refreshToken)
					.build();
					
		} catch (Exception e) {
			logger.error("Error activating staff account: " + e.getMessage(), e);
			throw new IllegalStateException("Không thể kích hoạt tài khoản: " + e.getMessage());
		}
	}

	/**
	 * Đăng ký người dùng (hỗ trợ SĐT hoặc Gmail). 
	 * - Nếu là SĐT: Lưu ngay vào database và trả về token
	 * - Nếu là Email: KHÔNG lưu vào database, chỉ gửi OTP và lưu thông tin tạm thời
	 */
	@Transactional
	public AuthResponseDTO registerUser(AccountRequestDTO request) {
		RoleEntity userRole = roleRepository.findByName("ROLE_USER")
				.orElseThrow(() -> new ResourceNotFoundException("Vai trò 'ROLE_USER' không tồn tại."));

		// Đăng ký bằng số điện thoại
		if (request.getPhone() != null && !request.getPhone().isEmpty()) {
			if (accountRepository.findByPhone(request.getPhone()).isPresent()) {
				throw new IllegalStateException("Số điện thoại đã được sử dụng.");
			}

			AccountEntity account = new AccountEntity();
			account.setPhone(request.getPhone());
			account.setName(request.getName());
			account.setPassword(passwordEncoder.encode(request.getPassword()));
			account.setStatus(AccountStatus.ACTIVE);
			account.setRole(userRole);

			AccountEntity saved = accountRepository.save(account);

			return generateTokenForUser(saved); // Trả về token cho đăng ký qua SĐT
		}

		// Đăng ký bằng email -> Gửi OTP (KHÔNG lưu vào database)
		if (request.getEmail() != null && !request.getEmail().isEmpty()) {
			if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
				throw new IllegalStateException("Email đã được sử dụng.");
			}

			// Sinh OTP
			String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
			
			// Lưu thông tin tạm thời vào memory cache (KHÔNG lưu vào database)
			tempRegistrationService.saveTempRegistration(
				request.getEmail(),
				request.getEmail(), // Sử dụng email làm username tạm thời
				request.getName(),
				request.getPassword(), // Lưu password gốc, sẽ encode khi tạo tài khoản
				otp,
				LocalDateTime.now().plusMinutes(10)
			);
			
			logger.info("Temporary registration data stored in memory for email: {}, OTP: {}", request.getEmail(), otp);

			// Gửi OTP
			try {
				emailService.sendVerificationCode(request.getEmail(), otp);
				logger.info("OTP email sent successfully to: {}", request.getEmail());
			} catch (Exception e) {
				logger.error("Không thể gửi email OTP: " + e.getMessage());
				// Xóa dữ liệu tạm thời nếu không gửi được email
				tempRegistrationService.removeTempRegistration(request.getEmail());
				throw new RuntimeException("Không thể gửi mã OTP. Vui lòng thử lại.");
			}

			// Trả về phản hồi với thông tin OTP đã được gửi
			return AuthResponseDTO.builder().message("Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.")
					.otpSent(true).build();
		}

		throw new IllegalArgumentException("Bạn phải cung cấp SĐT hoặc Email để đăng ký.");
	}

	/**
	 * Gửi OTP đăng ký (sử dụng RegisterOtpRequestDTO)
	 * - KHÔNG lưu vào database, chỉ lưu thông tin tạm thời trong memory cache
	 */
	@Transactional
	public AuthResponseDTO registerUser(RegisterOtpRequestDTO request) {
		RoleEntity userRole = roleRepository.findByName("ROLE_USER")
				.orElseThrow(() -> new ResourceNotFoundException("Vai trò 'ROLE_USER' không tồn tại."));

		// Kiểm tra username đã tồn tại chưa
		if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
			throw new IllegalStateException("Username đã được sử dụng.");
		}

		// Kiểm tra email đã tồn tại chưa
		if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
			throw new IllegalStateException("Email đã được sử dụng.");
		}

		// Sinh OTP và sessionId
		String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
		String sessionId = "email_" + System.currentTimeMillis();
		
		// Lưu thông tin tạm thời vào memory cache (KHÔNG lưu vào database)
		tempRegistrationService.saveTempRegistration(
			request.getEmail(),
			request.getUsername(),
			request.getName(),
			request.getPassword(), // Lưu password gốc, sẽ encode khi tạo tài khoản
			otp,
			LocalDateTime.now().plusMinutes(10),
			sessionId
		);
		
		logger.info("Temporary registration data stored in memory for email: {}, OTP: {}", request.getEmail(), otp);

		// Gửi OTP
		try {
			emailService.sendVerificationCode(request.getEmail(), otp);
			logger.info("OTP email sent successfully to: {}", request.getEmail());
		} catch (Exception e) {
			logger.error("Không thể gửi email OTP: " + e.getMessage());
			// Xóa dữ liệu tạm thời nếu không gửi được email
			tempRegistrationService.removeTempRegistration(request.getEmail());
			throw new RuntimeException("Không thể gửi mã OTP. Vui lòng thử lại.");
		}

		// Trả về phản hồi với thông tin OTP đã được gửi
		return AuthResponseDTO.builder().message("Đăng ký thành công. Vui lòng kiểm tra email để xác thực OTP.")
				.otpSent(true).sessionId(sessionId).build();
	}

	/**
	 * Xác thực OTP và tạo tài khoản thực sự
	 */
	@Transactional
	public AuthResponseDTO verifyOtp(String email, String otp) {
		return verifyOtp(email, otp, null);
	}

	/**
	 * Xác thực OTP và tạo tài khoản thực sự với sessionId
	 */
	@Transactional
	public AuthResponseDTO verifyOtp(String email, String otp, String sessionId) {
		// Kiểm tra OTP từ memory cache
		if (!tempRegistrationService.isValidOtp(email, otp)) {
			throw new IllegalStateException("Mã OTP không chính xác hoặc đã hết hạn.");
		}

		// Lấy thông tin đăng ký tạm thời
		TempRegistrationService.TempRegistrationData tempData = tempRegistrationService.getTempRegistration(email);
		if (tempData == null) {
			throw new IllegalStateException("Không tìm thấy thông tin đăng ký tạm thời.");
		}

		// Kiểm tra sessionId nếu có
		if (sessionId != null && tempData.getSessionId() != null && !sessionId.equals(tempData.getSessionId())) {
			throw new IllegalStateException("Mã OTP không hợp lệ. Vui lòng sử dụng mã OTP mới nhất.");
		}

		// Kiểm tra xem email đã được sử dụng chưa (có thể có người khác đăng ký trong lúc này)
		if (accountRepository.findByEmail(email).isPresent()) {
			tempRegistrationService.removeTempRegistration(email);
			throw new IllegalStateException("Email đã được sử dụng.");
		}

		// Kiểm tra xem username đã được sử dụng chưa
		if (accountRepository.findByUsername(tempData.getUsername()).isPresent()) {
			tempRegistrationService.removeTempRegistration(email);
			throw new IllegalStateException("Username đã được sử dụng.");
		}

		// Tạo tài khoản thực sự trong database
		RoleEntity userRole = roleRepository.findByName("ROLE_USER")
				.orElseThrow(() -> new ResourceNotFoundException("Vai trò 'ROLE_USER' không tồn tại."));

		AccountEntity account = new AccountEntity();
		account.setEmail(tempData.getEmail());
		account.setUsername(tempData.getUsername());
		account.setName(tempData.getName());
		account.setPassword(passwordEncoder.encode(tempData.getPassword())); // Encode password trước khi lưu
		account.setStatus(AccountStatus.ACTIVE);
		account.setRole(userRole);
		// Reset các trường khóa tài khoản
		account.setFailedAttempts(0);
		account.setLockTime(null);
		account.setLastFailedAttempt(null);

		AccountEntity saved = accountRepository.save(account);
		
		// Xóa dữ liệu tạm thời sau khi tạo tài khoản thành công
		tempRegistrationService.removeTempRegistration(email);
		
		logger.info("Account created and activated successfully: {}", email);
		return generateTokenForUser(saved);
	}

	/**
	 * Đăng ký bằng số điện thoại với OTP SMS (đơn giản hóa - không cần username/name)
	 */
	@Transactional
	public AuthResponseDTO registerUserByPhone(PhoneRegistrationRequestDTO request) {
		// Validate input trước
		validatePhoneRegistration(request);
		
		RoleEntity userRole = roleRepository.findByName("ROLE_USER")
				.orElseThrow(() -> new ResourceNotFoundException("Vai trò 'ROLE_USER' không tồn tại."));

		// Kiểm tra số điện thoại đã tồn tại chưa
		if (accountRepository.findByPhone(request.getPhone()).isPresent()) {
			throw new IllegalStateException("Số điện thoại đã được sử dụng.");
		}

		// Sinh OTP
		String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
		String sessionId = "phone_" + System.currentTimeMillis();
		
		// Lưu thông tin tạm thời vào memory cache
		tempRegistrationService.saveTempRegistration(
			request.getPhone(),
			request.getPhone(), // Sử dụng phone làm username
			"Người dùng", // Tên mặc định
			request.getPassword(),
			otp,
			LocalDateTime.now().plusMinutes(10),
			sessionId
		);
		
		logger.info("Temporary phone registration data stored in memory for phone: {}, OTP: {}, SessionId: {}", 
			request.getPhone(), otp, sessionId);

		// Gửi OTP qua SMS
		boolean smsSent = false;
		try {
							smsSent = speedSmsService.sendOtpVia2FA(request.getPhone(), otp);
			if (!smsSent) {
				logger.error("Failed to send SMS OTP to: {}", request.getPhone());
				tempRegistrationService.removeTempRegistration(request.getPhone());
				throw new RuntimeException("Không thể gửi mã OTP qua SMS. Vui lòng thử lại.");
			}
			logger.info("SMS OTP sent successfully to: {}", request.getPhone());
		} catch (Exception e) {
			logger.error("Error sending SMS OTP: " + e.getMessage());
			// Chỉ xóa dữ liệu nếu SMS chưa được gửi
			if (!smsSent) {
				tempRegistrationService.removeTempRegistration(request.getPhone());
			}
			throw new RuntimeException("Không thể gửi mã OTP qua SMS. Vui lòng thử lại.");
		}

		// Trả về phản hồi với thông tin OTP đã được gửi
		return AuthResponseDTO.builder()
			.message("Đăng ký thành công. Vui lòng kiểm tra SMS để xác thực OTP.")
			.otpSent(true)
			.sessionId(sessionId)
			.build();
	}

	/**
	 * Validate phone registration request
	 */
	private void validatePhoneRegistration(PhoneRegistrationRequestDTO request) {
		if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
			throw new IllegalArgumentException("Số điện thoại không được để trống");
		}
		
		if (!request.getPhone().matches("^[0-9]{10,11}$")) {
			throw new IllegalArgumentException("Số điện thoại phải có 10-11 chữ số");
		}
		
		if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
			throw new IllegalArgumentException("Mật khẩu không được để trống");
		}
		
		if (request.getPassword().length() < 6) {
			throw new IllegalArgumentException("Mật khẩu phải có ít nhất 6 ký tự");
		}
	}

	/**
	 * Gửi OTP đăng nhập
	 */
	@Transactional
	public AuthResponseDTO sendLoginOtp(String phone) {
		// Kiểm tra số điện thoại có tồn tại không
		AccountEntity account = accountRepository.findByPhone(phone)
				.orElseThrow(() -> new IllegalStateException("Số điện thoại chưa được đăng ký."));

		// Kiểm tra tài khoản có bị khóa không
		if (account.getStatus() == AccountStatus.INACTIVE) {
			throw new IllegalStateException("Tài khoản đã bị tạm khóa.");
		}
		
		if (account.getStatus() == AccountStatus.LOCKED) {
			throw new IllegalStateException("Tài khoản đã bị khóa vĩnh viễn.");
		}

		// Sinh OTP
		String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
		String sessionId = "login_" + System.currentTimeMillis();
		
		// Lưu OTP tạm thời cho đăng nhập
		tempRegistrationService.saveTempRegistration(
			phone,
			account.getUsername(),
			account.getName(),
			"", // Không cần password cho login OTP
			otp,
			LocalDateTime.now().plusMinutes(5), // OTP đăng nhập hết hạn sau 5 phút
			sessionId
		);
		
		logger.info("Login OTP stored for phone: {}, OTP: {}, SessionId: {}", phone, otp, sessionId);

		// Gửi OTP qua SMS
		try {
			boolean smsSent = speedSmsService.sendOtpVia2FA(phone, otp);
			if (!smsSent) {
				logger.error("Failed to send login SMS OTP to: {}", phone);
				tempRegistrationService.removeTempRegistration(phone);
				throw new RuntimeException("Không thể gửi mã OTP qua SMS. Vui lòng thử lại.");
			}
			logger.info("Login SMS OTP sent successfully to: {}", phone);
		} catch (Exception e) {
			logger.error("Error sending login SMS OTP: " + e.getMessage());
			tempRegistrationService.removeTempRegistration(phone);
			throw new RuntimeException("Không thể gửi mã OTP qua SMS. Vui lòng thử lại.");
		}

		return AuthResponseDTO.builder()
			.message("Mã OTP đã được gửi đến số điện thoại của bạn.")
			.otpSent(true)
			.sessionId(sessionId)
			.build();
	}

	/**
	 * Đăng nhập bằng OTP
	 */
	@Transactional
	public AuthResponseDTO loginByOtp(String phone, String otp, String sessionId) {
		// Kiểm tra OTP từ memory cache
		if (!tempRegistrationService.isValidOtp(phone, otp)) {
			throw new IllegalStateException("Mã OTP không chính xác hoặc đã hết hạn.");
		}

		// Lấy thông tin tạm thời
		TempRegistrationService.TempRegistrationData tempData = tempRegistrationService.getTempRegistration(phone);
		if (tempData == null) {
			throw new IllegalStateException("Không tìm thấy thông tin OTP.");
		}

		// Kiểm tra sessionId nếu có
		if (sessionId != null && tempData.getSessionId() != null && !sessionId.equals(tempData.getSessionId())) {
			throw new IllegalStateException("Mã OTP không hợp lệ. Vui lòng sử dụng mã OTP mới nhất.");
		}

		// Tìm tài khoản
		AccountEntity account = accountRepository.findByPhone(phone)
				.orElseThrow(() -> new IllegalStateException("Tài khoản không tồn tại."));

		// Kiểm tra trạng thái tài khoản
		if (account.getStatus() == AccountStatus.INACTIVE) {
			throw new IllegalStateException("Tài khoản đã bị tạm khóa.");
		}
		
		if (account.getStatus() == AccountStatus.LOCKED) {
			throw new IllegalStateException("Tài khoản đã bị khóa vĩnh viễn.");
		}

		// Reset số lần thất bại khi đăng nhập thành công
		resetFailedAttempts(account);

		// Xóa OTP tạm thời
		tempRegistrationService.removeTempRegistration(phone);

		// Tạo token
		var accessToken = jwtService.generateToken(account);
		var refreshToken = jwtService.generateRefreshToken(account);

		account.setRefreshToken(refreshToken);
		account.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpiration)));
		accountRepository.save(account);

		logger.info("User logged in successfully via OTP: {}", phone);
		return AuthResponseDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
	}

	@Transactional
	public String resendOtp(String email) throws MessagingException {
		// Kiểm tra xem có thông tin đăng ký tạm thời không
		TempRegistrationService.TempRegistrationData tempData = tempRegistrationService.getTempRegistration(email);
		if (tempData == null) {
			throw new ResourceNotFoundException("Không tìm thấy thông tin đăng ký tạm thời cho email: " + email);
		}

		// Kiểm tra xem tài khoản đã được tạo chưa
		if (accountRepository.findByEmail(email).isPresent()) {
			tempRegistrationService.removeTempRegistration(email);
			return "Tài khoản đã được xác thực trước đó.";
		}

		// Sinh OTP mới
		String newOtp = String.valueOf((int) (Math.random() * 900000) + 100000);
		
		// Cập nhật OTP mới trong memory cache
		tempRegistrationService.saveTempRegistration(
			tempData.getEmail(),
			tempData.getUsername(),
			tempData.getName(),
			tempData.getPassword(),
			newOtp,
			LocalDateTime.now().plusMinutes(10)
		);

		emailService.sendVerificationCode(email, newOtp);
		return "Đã gửi lại mã xác thực OTP đến email.";
	}

	/**
	 * Dọn dẹp dữ liệu đăng ký tạm thời hết hạn (có thể gọi bởi scheduler)
	 */
	public void cleanupUnverifiedAccounts() {
		// Dọn dẹp memory cache
		tempRegistrationService.cleanupExpiredData();
		
		// Dọn dẹp các tài khoản tạm thời cũ trong database (nếu có)
		LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(10);
		List<AccountEntity> unverifiedAccounts = accountRepository.findByStatusAndOtpExpiryBefore(
				AccountStatus.INACTIVE, cutoffTime);
		
		for (AccountEntity account : unverifiedAccounts) {
			logger.info("Deleting old unverified account from database: {}", account.getEmail());
			accountRepository.delete(account);
		}
		
		logger.info("Cleanup completed. Removed {} old unverified accounts from database", unverifiedAccounts.size());
	}

	/**
	 * Sinh accessToken và refreshToken cho user
	 */
	private AuthResponseDTO generateTokenForUser(AccountEntity user) {
		var accessToken = jwtService.generateToken(user);
		var refreshToken = jwtService.generateRefreshToken(user);

		user.setRefreshToken(refreshToken);
		user.setRefreshTokenExpiry(LocalDateTime.now().plus(Duration.ofMillis(refreshTokenExpiration)));
		accountRepository.save(user);

		return AuthResponseDTO.builder().accessToken(accessToken).refreshToken(refreshToken).build();
	}

	/**
	 * Kiểm tra OTP trong database (cho debug)
	 */
	public String checkOtpInDatabase(String email) {
		AccountEntity account = accountRepository.findByEmail(email).orElse(null);

		if (account == null) {
			return "Account not found";
		}

		return String.format("Email: %s, OTP: %s, Expiry: %s, Status: %s", email, account.getOtpCode(),
				account.getOtpExpiry(), account.getStatus());
	}

	    /**
     * Kiểm tra user trong database (cho debug)
     */
    public String checkUserInDatabase(String identifier) {
        AccountEntity account = accountRepository.findByUsername(identifier)
                .or(() -> accountRepository.findByEmail(identifier))
                .orElse(null);

        if (account == null) {
            return "User not found with identifier: " + identifier;
        }

        return String.format("ID: %d, Username: %s, Email: %s, Status: %s, HasPassword: %s", account.getId(),
                account.getUsername(), account.getEmail(), account.getStatus(),
                account.getPassword() != null && !account.getPassword().isEmpty());
    }

	/**
	 * Làm mới token
	 */
	@Transactional
	public AuthResponseDTO refreshToken(RefreshTokenRequestDTO request) {
		AccountEntity account = accountRepository.findByRefreshToken(request.getRefreshToken())
				.orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ."));

		if (account.getRefreshTokenExpiry().isBefore(LocalDateTime.now())) {
			throw new RuntimeException("Refresh token đã hết hạn. Vui lòng đăng nhập lại.");
		}

		return generateTokenForUser(account);
	}

	// Các hàm tìm kiếm, update giữ nguyên
	@Transactional(readOnly = true)
	public List<AccountResponseDTO> searchUsersByKeyword(String keyword) {
		return accountRepository.findByRoleAndKeyword("ROLE_USER", keyword.toLowerCase()).stream()
				.map(AccountMapper::toResponseDto).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public List<AccountResponseDTO> getAllAccount() {
		return accountRepository.findAll().stream().peek(acc -> {
			if (acc.getBranch() != null) {
				acc.getBranch().getName();
			}
		}).map(AccountMapper::toResponseDto).collect(Collectors.toList());
	}

	@Transactional(readOnly = true)
	public Page<AccountResponseDTO> getAllAccount(Pageable pageable) {
		return accountRepository.findAll(pageable).map(acc -> {
			if (acc.getBranch() != null) {
				acc.getBranch().getName();
			}
			return AccountMapper.toResponseDto(acc);
		});
	}

	@Transactional
	public AccountResponseDTO updateAccountStatus(Long accountId, AccountStatus newStatus) {
		AccountEntity account = accountRepository.findById(accountId)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));
		
		// Nếu chuyển từ INACTIVE (Tạm khóa) sang ACTIVE (Hoạt động), reset số lần thất bại
		if (account.getStatus() == AccountStatus.INACTIVE && newStatus == AccountStatus.ACTIVE) {
			logger.info("Resetting failed attempts for account {} when changing status from INACTIVE to ACTIVE", account.getEmail());
			account.setFailedAttempts(0);
			account.setLockTime(null);
			account.setLastFailedAttempt(null);
		}
		
		account.setStatus(newStatus);
		return AccountMapper.toResponseDto(accountRepository.save(account));
	}

	@Transactional
	public AccountResponseDTO updateAccountRole(Long accountId, String roleName) {
		AccountEntity account = accountRepository.findById(accountId)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));

		RoleEntity newRole = roleRepository.findByName(roleName)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò: " + roleName));

		account.setRole(newRole);
		return AccountMapper.toResponseDto(accountRepository.save(account));
	}





	@Transactional
	public AccountResponseDTO updateAccount(Long accountId, StaffUpdateRequestDTO request) {
		AccountEntity account = accountRepository.findById(accountId)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

		System.out.println("Received request: " + request);
		if (request.getBranchId() != null) {
			if (request.getBranchId() == 0 || request.getBranchId() < 0) {
				account.setBranch(null);
				System.out.println("Setting branch to null for accountId: " + accountId);
			} else {
				BranchEntity branch = branchRepository.findById(request.getBranchId())
						.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy chi nhánh"));
				account.setBranch(branch);
				System.out.println("Setting branch to: " + branch.getId() + " for accountId: " + accountId);
			}
		} else {
			account.setBranch(null);
			System.out.println("No branchId provided, setting to null for accountId: " + accountId);
		}

		if (request.getRoleName() != null) {
			RoleEntity newRole = roleRepository.findByName(request.getRoleName())
					.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy vai trò"));
			account.setRole(newRole);
			System.out.println("Updated role to: " + request.getRoleName() + " for accountId: " + accountId);
		}

		AccountEntity savedAccount = accountRepository.save(account);
		System.out.println("Saved account: " + savedAccount);
		return AccountMapper.toResponseDto(savedAccount);
	}

	@Transactional
	public void updatePassword(AccountEntity user, String newPassword) {
		user.setPassword(passwordEncoder.encode(newPassword));
		accountRepository.save(user);
	}

	@Transactional
	public AccountResponseDTO updateUserInfo(Long userId, AccountRequestDTO request) {
		AccountEntity account = accountRepository.findById(userId)
				.orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản."));

		account.setName(request.getName());
		account.setEmail(request.getEmail());
		account.setPhone(request.getPhone());

		// Nếu địa chỉ thay đổi, tự động lấy lat/lng
		if (request.getAddress() != null && !request.getAddress().equals(account.getAddress())) {
			account.setAddress(request.getAddress());
			double[] latLng = getLatLngFromAddress(request.getAddress());
			account.setLatitude(latLng[0]);
			account.setLongitude(latLng[1]);
		}

		AccountEntity saved = accountRepository.save(account);
		return AccountMapper.toResponseDto(saved);
	}

	private double[] getLatLngFromAddress(String address) {
		// Removed external API integration - return default coordinates
		return new double[] { 0.0, 0.0 };
	}
}
