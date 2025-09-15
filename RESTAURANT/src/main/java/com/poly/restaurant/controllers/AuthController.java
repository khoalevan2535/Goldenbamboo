package com.poly.restaurant.controllers;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.poly.restaurant.dtos.AccountRequestDTO;
import com.poly.restaurant.dtos.AuthResponseDTO;
import com.poly.restaurant.dtos.ChangePasswordRequestDTO;
import com.poly.restaurant.dtos.ForgotPasswordRequestDTO;
import com.poly.restaurant.dtos.LoginRequestDTO;
import com.poly.restaurant.dtos.SetPasswordRequestDTO;
import com.poly.restaurant.dtos.RefreshTokenRequestDTO;
import com.poly.restaurant.dtos.RegisterOtpRequestDTO;
import com.poly.restaurant.dtos.ResetPasswordRequestDTO;
import com.poly.restaurant.dtos.StaffRegistrationRequestDTO;
import com.poly.restaurant.dtos.PhoneRegistrationRequestDTO;
import com.poly.restaurant.dtos.VerifyOtpRequestDTO;
import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.RoleEntity;
import com.poly.restaurant.entities.enums.AccountStatus;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.RoleRepository;
import com.poly.restaurant.services.AccountService;
import com.poly.restaurant.services.EmailService;
import com.poly.restaurant.dtos.AccountResponseDTO;
import com.poly.restaurant.mappers.AccountMapper;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import jakarta.mail.MessagingException;
import jakarta.validation.Valid;
import jakarta.validation.groups.Default;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.poly.restaurant.dtos.UpdateProfileRequestDTO;
import com.poly.restaurant.dtos.ChangePasswordRequestDTO;
import com.poly.restaurant.services.CloudinaryService;

import org.springframework.web.client.RestTemplate;
import org.json.JSONArray;
import org.json.JSONObject;
import com.poly.restaurant.dtos.LoginOtpRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import com.poly.restaurant.services.SpeedSmsService;
import com.poly.restaurant.services.TempRegistrationService;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    private final AccountService accountService;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final CloudinaryService cloudinaryService;
    	    private final SpeedSmsService speedSmsService;
    private final TempRegistrationService tempRegistrationService;
    
    

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtpRequestDTO request) {
        try {
            AuthResponseDTO response = accountService.verifyOtp(request.getEmail(), request.getOtp(), request.getSessionId());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            String errorMessage = "Xác thực OTP thất bại";
            if (e.getMessage() != null) {
                if (e.getMessage().contains("OTP")) {
                    errorMessage = "Mã OTP không đúng hoặc đã hết hạn";
                } else if (e.getMessage().contains("Email")) {
                    errorMessage = "Email hoặc số điện thoại không tồn tại";
                } else {
                    errorMessage = e.getMessage();
                }
            }
            return ResponseEntity.badRequest().body(errorMessage);
        }
    }

    @PostMapping("/register-phone")
    public ResponseEntity<?> registerByPhone(@Valid @RequestBody PhoneRegistrationRequestDTO request) {
        try {
            logger.info("Received phone registration request: phone={}, password length={}", 
                request.getPhone(), request.getPassword() != null ? request.getPassword().length() : 0);
            
            AuthResponseDTO response = accountService.registerUserByPhone(request);
            logger.info("Phone registration successful for phone: {}", request.getPhone());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Phone registration failed for phone: {}, error: {}", request.getPhone(), e.getMessage(), e);
            
            String errorMessage = "Đăng ký bằng số điện thoại thất bại";
            if (e.getMessage() != null) {
                if (e.getMessage().contains("Username")) {
                    errorMessage = "Username đã được sử dụng";
                } else if (e.getMessage().contains("Số điện thoại")) {
                    errorMessage = "Số điện thoại đã được sử dụng";
                } else if (e.getMessage().contains("SMS")) {
                    errorMessage = "Không thể gửi SMS. Vui lòng thử lại";
                } else {
                    errorMessage = e.getMessage();
                }
            }
            return ResponseEntity.badRequest().body(Map.of("error", errorMessage));
        }
    }

    // Endpoint để kiểm tra OTP trong database (cho debug)
    @GetMapping("/check-otp/{email}")
    public ResponseEntity<String> checkOtp(@PathVariable String email) {
        String result = accountService.checkOtpInDatabase(email);
        return ResponseEntity.ok(result);
    }

    // Endpoint để kiểm tra user trong database (cho debug)
    @GetMapping("/check-user/{identifier}")
    public ResponseEntity<String> checkUser(@PathVariable String identifier) {
        String result = accountService.checkUserInDatabase(identifier);
        return ResponseEntity.ok(result);
    }

    // Endpoint để test load user với role
    @GetMapping("/test-user/{identifier}")
    public ResponseEntity<String> testUser(@PathVariable String identifier) {
        try {
            var user = accountRepository.findByUsername(identifier)
                    .or(() -> accountRepository.findByEmail(identifier))
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.ok("User not found: " + identifier);
            }
            
            String result = String.format(
                "User found: ID=%d, Username=%s, Email=%s, Status=%s, Role=%s, RoleID=%d",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus(),
                user.getRole() != null ? user.getRole().getName() : "NULL",
                user.getRole() != null ? user.getRole().getId() : -1
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    // Endpoint để test JWT token generation
    @GetMapping("/test-jwt/{identifier}")
    public ResponseEntity<String> testJwt(@PathVariable String identifier) {
        try {
            var user = accountRepository.findByUsername(identifier)
                    .or(() -> accountRepository.findByEmail(identifier))
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.ok("User not found: " + identifier);
            }
            
            // Test JWT generation
            var jwtService = new com.poly.restaurant.services.JwtService();
            var accessToken = jwtService.generateToken(user);
            
            // Decode token to check content
            var decoded = io.jsonwebtoken.Jwts.parserBuilder()
                    .setSigningKey(java.util.Base64.getDecoder().decode("472D4B6150645367566B5970337336763979244226452948404D635165546857"))
                    .build()
                    .parseClaimsJws(accessToken)
                    .getBody();
            
            String result = String.format(
                "JWT Test: User=%s, Role=%s, Token=%s, Claims=%s",
                user.getUsername(),
                user.getRole() != null ? user.getRole().getName() : "NULL",
                accessToken.substring(0, Math.min(50, accessToken.length())) + "...",
                decoded.toString()
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    // Endpoint để kiểm tra trạng thái tài khoản (cho debug)
    @GetMapping("/check-account-status/{identifier}")
    public ResponseEntity<String> checkAccountStatus(@PathVariable String identifier) {
        try {
            var user = accountRepository.findByUsername(identifier)
                    .or(() -> accountRepository.findByEmail(identifier))
                    .orElse(null);
            
            if (user == null) {
                return ResponseEntity.ok("User not found: " + identifier);
            }
            
            String result = String.format(
                "Account Status: ID=%d, Username=%s, Email=%s, Status=%s, FailedAttempts=%d, LockTime=%s, LastFailedAttempt=%s",
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getStatus(),
                user.getFailedAttempts() != null ? user.getFailedAttempts() : 0,
                user.getLockTime() != null ? user.getLockTime().toString() : "NULL",
                user.getLastFailedAttempt() != null ? user.getLastFailedAttempt().toString() : "NULL"
            );
            
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.ok("Error: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> me(@AuthenticationPrincipal AccountEntity currentUser) {
        // Đảm bảo load kèm chi nhánh để trả về branchName
        AccountEntity loaded = accountRepository.findByIdWithBranch(currentUser.getId()).orElse(currentUser);
        return ResponseEntity.ok(AccountMapper.toResponseDto(loaded));
    }
    
    @PatchMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> updateMe(
            @AuthenticationPrincipal AccountEntity currentUser,
            @RequestBody UpdateProfileRequestDTO request
    ) {
        if (request.getName() != null) currentUser.setName(request.getName());
        if (request.getPhone() != null) currentUser.setPhone(request.getPhone());
        AccountEntity saved = accountRepository.save(currentUser);
        return ResponseEntity.ok(AccountMapper.toResponseDto(saved));
    }
    
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> updateMePut(
            @AuthenticationPrincipal AccountEntity currentUser,
            @RequestBody UpdateProfileRequestDTO request
    ) {
        if (request.getName() != null) currentUser.setName(request.getName());
        if (request.getPhone() != null) currentUser.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) currentUser.setAvatarUrl(request.getAvatarUrl());
        if (request.getAddress() != null) {
        currentUser.setAddress(request.getAddress());
        double[] latLng = getLatLngFromAddress(request.getAddress());
        currentUser.setLatitude(latLng[0]);
        currentUser.setLongitude(latLng[1]);
    }
        AccountEntity saved = accountRepository.save(currentUser);
        return ResponseEntity.ok(AccountMapper.toResponseDto(saved));
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
        return new double[]{lat, lon};
    }
    throw new RuntimeException("Không lấy được vị trí từ địa chỉ");
}

    @PostMapping(value = "/me/avatar", consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AccountResponseDTO> uploadAvatar(
            @AuthenticationPrincipal AccountEntity currentUser,
            @RequestParam("file") MultipartFile file
    ) {
        String url = cloudinaryService.uploadFile(file);
        currentUser.setAvatarUrl(url);
        AccountEntity saved = accountRepository.save(currentUser);
        return ResponseEntity.ok(AccountMapper.toResponseDto(saved));
    }
    
    /**
     * Đăng ký tài khoản người dùng (khách).
     * - Hỗ trợ email hoặc số điện thoại.
     * - Sau khi đăng ký sẽ gửi mã OTP qua email để kích hoạt.
     */
    @PostMapping("/register-user")
    public ResponseEntity<AuthResponseDTO> registerUser(
            @Valid @Validated({Default.class, AccountRequestDTO.EmailOrPhoneGroup.class}) @RequestBody AccountRequestDTO request) {
        AuthResponseDTO authResponse = accountService.registerUser(request);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }
    /**
     * Chỉ Admin hoặc Manager mới được tạo tài khoản nhân viên/quản lý.
     * - Không cho nhân viên tự ý đăng ký staff.
     */
    @PostMapping("/register-staff")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AuthResponseDTO> registerStaff(
            @Valid @RequestBody StaffRegistrationRequestDTO request,
            Authentication authentication) {

        AccountEntity loggedInUser = (AccountEntity) authentication.getPrincipal();
        AuthResponseDTO authResponse = accountService.registerStaff(request, loggedInUser);
        return new ResponseEntity<>(authResponse, HttpStatus.CREATED);
    }

    /**
     * Đăng nhập bằng username/email/số điện thoại.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            AuthResponseDTO response = accountService.login(request);
            // set refresh token to httpOnly cookie, remove from body
            ResponseCookie cookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                    .httpOnly(true).secure(false).sameSite("Lax").path("/api/auth")
                    .build();
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(response);
        } catch (Exception e) {
            // Lấy thông tin về số lần thất bại
            String failedAttemptsInfo = accountService.getFailedAttemptsInfo(request.getLoginIdentifier());
            
            // Tạo response object với thông tin chi tiết
            Map<String, Object> errorResponse = Map.of(
                "error", e.getMessage(),
                "failedAttemptsInfo", failedAttemptsInfo
            );
            
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * Làm mới token khi accessToken hết hạn.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponseDTO> refreshToken(
            @org.springframework.web.bind.annotation.CookieValue(value = "refreshToken", required = false) String refreshFromCookie,
            @RequestBody(required = false) RefreshTokenRequestDTO request) {
        String token = refreshFromCookie != null ? refreshFromCookie : (request != null ? request.getRefreshToken() : null);
        AuthResponseDTO response = accountService.refreshToken(new RefreshTokenRequestDTO(){ { setRefreshToken(token); } });
        // rotate cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", response.getRefreshToken())
                .httpOnly(true).secure(false).sameSite("Lax").path("/api/auth")
                .build();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }
    
    // 1. Gửi mã OTP về email
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequestDTO request) {
        try {
            Optional<AccountEntity> userOpt = accountRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email không tồn tại.");
            }

            AccountEntity user = userOpt.get();
            
            // Kiểm tra tài khoản có bị khóa không
            if (user.getStatus() == AccountStatus.LOCKED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản đã bị khóa. Vui lòng liên hệ admin.");
            }

            // Sinh OTP và sessionId
            String otp = String.valueOf((int) (Math.random() * 900000) + 100000);
            String sessionId = "forgot_" + System.currentTimeMillis();
            
            // Lưu OTP vào memory cache thay vì database
            tempRegistrationService.saveTempRegistration(
                request.getEmail(),
                user.getUsername(),
                user.getName(),
                null, // Không lưu password trong forgot password
                otp,
                LocalDateTime.now().plusMinutes(10),
                sessionId
            );
            
            logger.info("Forgot password OTP stored in memory for email: {}, OTP: {}", request.getEmail(), otp);

            // Gửi OTP qua email
            try {
                emailService.sendVerificationCode(user.getEmail(), otp);
                logger.info("Forgot password OTP email sent successfully to: {}", request.getEmail());
            } catch (Exception e) {
                logger.error("Không thể gửi email OTP: " + e.getMessage());
                // Xóa dữ liệu tạm thời nếu không gửi được email
                tempRegistrationService.removeTempRegistration(request.getEmail());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Không thể gửi mã OTP. Vui lòng thử lại sau.");
            }

            return ResponseEntity.ok(Map.of(
                "message", "Đã gửi mã xác nhận đến email.",
                "sessionId", sessionId
            ));
            
        } catch (Exception e) {
            logger.error("Error in forgot password: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }

    // 2. Đặt lại mật khẩu bằng OTP
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequestDTO request) {
        try {
            Optional<AccountEntity> userOpt = accountRepository.findByEmail(request.getEmail());
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Email không hợp lệ.");
            }

            AccountEntity user = userOpt.get();
            
            // Kiểm tra tài khoản có bị khóa không
            if (user.getStatus() == AccountStatus.LOCKED) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Tài khoản đã bị khóa. Vui lòng liên hệ admin.");
            }

            // Kiểm tra OTP từ memory cache
            if (!tempRegistrationService.isValidOtp(request.getEmail(), request.getOtp())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
            }

            // Lấy thông tin tạm thời để kiểm tra sessionId nếu có
            TempRegistrationService.TempRegistrationData tempData = tempRegistrationService.getTempRegistration(request.getEmail());
            if (tempData != null && request.getSessionId() != null && 
                tempData.getSessionId() != null && !request.getSessionId().equals(tempData.getSessionId())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mã OTP không hợp lệ. Vui lòng sử dụng mã OTP mới nhất.");
            }

            // Cập nhật mật khẩu
            accountService.updatePassword(user, request.getNewPassword());

            // Xóa dữ liệu tạm thời sau khi đặt lại mật khẩu thành công
            tempRegistrationService.removeTempRegistration(request.getEmail());

            logger.info("Password reset successfully for email: {}", request.getEmail());
            return ResponseEntity.ok("Đặt lại mật khẩu thành công.");
            
        } catch (Exception e) {
            logger.error("Error in reset password: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Có lỗi xảy ra. Vui lòng thử lại sau.");
        }
    }

    // Gửi OTP xác thực email khi đăng ký (KHÔNG lưu vào database)
    @PostMapping("/send-register-otp")
    public ResponseEntity<?> sendRegisterOtp(@RequestBody Map<String, String> payload) throws MessagingException {
        String email = payload.get("email");
        String username = payload.get("username");
        String name = payload.get("name");
        String password = payload.get("password");
        
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body("Email là bắt buộc");
        }
        if (username == null || username.isEmpty()) {
            return ResponseEntity.badRequest().body("Username là bắt buộc");
        }

        if (password == null || password.isEmpty()) {
            return ResponseEntity.badRequest().body("Mật khẩu là bắt buộc");
        }
        if (password.length() < 6) {
            return ResponseEntity.badRequest().body("Mật khẩu phải có ít nhất 6 ký tự");
        }
        
        // Kiểm tra username đã tồn tại chưa
        Optional<AccountEntity> existingUsernameOpt = accountRepository.findByUsername(username);
        if (existingUsernameOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body("Username đã được sử dụng");
        }
        
        // Kiểm tra email đã tồn tại chưa
        Optional<AccountEntity> existingEmailOpt = accountRepository.findByEmail(email);
        if (existingEmailOpt.isPresent()) {
            AccountEntity existing = existingEmailOpt.get();
            // Nếu tài khoản đã ACTIVE và có password, báo lỗi
            if (existing.getStatus() == AccountStatus.ACTIVE && 
                existing.getPassword() != null && !existing.getPassword().isEmpty()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Email đã được sử dụng");
            }
        }
        
        // Sử dụng AccountService để gửi OTP (sẽ lưu vào memory cache, không lưu vào database)
        try {
            RegisterOtpRequestDTO request = new RegisterOtpRequestDTO();
            request.setEmail(email);
            request.setUsername(username);
            request.setName(name != null ? name.trim() : null);
            request.setPassword(password);
            
            AuthResponseDTO response = accountService.registerUser(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Kích hoạt tài khoản nhân viên
    @PostMapping("/activate-staff-account")
    public ResponseEntity<?> activateStaffAccount(@RequestBody Map<String, String> request) {
        try {
            String token = request.get("token");
            String newPassword = request.get("newPassword");
            
            if (token == null || token.isEmpty()) {
                return ResponseEntity.badRequest().body("Token kích hoạt không hợp lệ.");
            }
            
            if (newPassword == null || newPassword.isEmpty() || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("Mật khẩu phải có ít nhất 6 ký tự.");
            }
            
            // Xác thực token và kích hoạt tài khoản
            AuthResponseDTO response = accountService.activateStaffAccount(token, newPassword);
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Error in activate staff account: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Test endpoint để kiểm tra email service
    @PostMapping("/test-email")
    public ResponseEntity<?> testEmail(@RequestBody Map<String, String> request) {
        try {
            String to = request.get("email");
            if (to == null || to.isEmpty()) {
                return ResponseEntity.badRequest().body("Email không được để trống");
            }
            
            // Test gửi email đơn giản
            emailService.sendVerificationCode(to, "123456");
            logger.info("Test email sent successfully to: {}", to);
            
            return ResponseEntity.ok("Email test đã được gửi thành công đến: " + to);
        } catch (Exception e) {
            logger.error("Error sending test email: " + e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Lỗi gửi email: " + e.getMessage());
        }
    }

    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> changePassword(
            @AuthenticationPrincipal AccountEntity currentUser,
            @RequestBody ChangePasswordRequestDTO request
    ) {
        // Nếu user có mật khẩu hiện tại, kiểm tra currentPassword đúng
        if (currentUser.getPassword() != null && !currentUser.getPassword().isEmpty()) {
            if (request.getCurrentPassword() == null || !passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu hiện tại không đúng.");
            }
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu mới phải có ít nhất 6 ký tự.");
        }
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(currentUser);
        return ResponseEntity.ok("Đổi mật khẩu thành công.");
    }

    @PostMapping("/set-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> setPassword(
            @AuthenticationPrincipal AccountEntity currentUser,
            @RequestBody SetPasswordRequestDTO request
    ) {
        // Chỉ cho phép đặt password nếu tài khoản chưa có password (OAuth2 account)
        if (currentUser.getPassword() != null && !currentUser.getPassword().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Tài khoản đã có mật khẩu. Vui lòng sử dụng chức năng 'Đổi mật khẩu'.");
        }
        
        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Mật khẩu phải có ít nhất 6 ký tự.");
        }
        
        currentUser.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(currentUser);
        return ResponseEntity.ok("Đặt mật khẩu thành công. Bây giờ bạn có thể đăng nhập bằng email và mật khẩu.");
    }

    @PostMapping("/send-login-otp")
	public ResponseEntity<?> sendLoginOtp(@Valid @RequestBody LoginOtpRequestDTO request) {
		try {
			AuthResponseDTO response = accountService.sendLoginOtp(request.getPhone());
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error sending login OTP: " + e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/login-otp")
	public ResponseEntity<?> loginByOtp(@RequestBody Map<String, String> payload) {
		try {
			String phone = payload.get("phone");
			String otp = payload.get("otp");
			String sessionId = payload.get("sessionId");
			
			if (phone == null || otp == null) {
				return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại và mã OTP không được để trống"));
			}
			
			AuthResponseDTO response = accountService.loginByOtp(phone, otp, sessionId);
			return ResponseEntity.ok(response);
		} catch (Exception e) {
			logger.error("Error logging in with OTP: " + e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}

	@PostMapping("/test-sms")
	public ResponseEntity<?> testSmsApi() {
		try {
			boolean testResult = speedSmsService.testApiConnection();
			if (testResult) {
				return ResponseEntity.ok(Map.of("message", "SpeedSMS API test successful"));
			} else {
				return ResponseEntity.badRequest().body(Map.of("error", "SpeedSMS API test failed"));
			}
		} catch (Exception e) {
			logger.error("Error testing SMS API: " + e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", "Error testing SMS API: " + e.getMessage()));
		}
	}
    
    	@PostMapping("/test-phone-registration")
	public ResponseEntity<?> testPhoneRegistration(@RequestBody Map<String, Object> request) {
		try {
			logger.info("Test phone registration request received: {}", request);
			
			String phone = (String) request.get("phone");
			String password = (String) request.get("password");
			
			logger.info("Parsed data: phone={}, password length={}", phone, password != null ? password.length() : 0);
			
			// Validate manually
			if (phone == null || phone.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại không được để trống"));
			}
			
			if (!phone.matches("^[0-9]{10,11}$")) {
				return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại phải có 10-11 chữ số"));
			}
			
			if (password == null || password.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu không được để trống"));
			}
			
			if (password.length() < 6) {
				return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu phải có ít nhất 6 ký tự"));
			}
			
			return ResponseEntity.ok(Map.of("message", "Validation passed", "phone", phone));
			
		} catch (Exception e) {
			logger.error("Test phone registration error: {}", e.getMessage(), e);
			return ResponseEntity.badRequest().body(Map.of("error", "Test failed: " + e.getMessage()));
		}
	}

	@PostMapping("/debug-phone-registration")
	public ResponseEntity<?> debugPhoneRegistration(@RequestBody Map<String, Object> request) {
		try {
			String phone = (String) request.get("phone");
			String password = (String) request.get("password");
			
			logger.info("Debug phone registration: phone={}, password length={}", phone, password != null ? password.length() : 0);
			
			// Test validation
			if (phone == null || phone.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại không được để trống"));
			}
			
			if (!phone.matches("^[0-9]{10,11}$")) {
				return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại phải có 10-11 chữ số"));
			}
			
			if (password == null || password.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu không được để trống"));
			}
			
			if (password.length() < 6) {
				return ResponseEntity.badRequest().body(Map.of("error", "Mật khẩu phải có ít nhất 6 ký tự"));
			}
			
			// Test database check
			boolean phoneExists = accountRepository.findByPhone(phone).isPresent();
			
			// Test SMS sending
			String testOtp = "123456";
			boolean smsSent = speedSmsService.sendOtpVia2FA(phone, testOtp);
			
			Map<String, Object> result = Map.of(
				"phone", phone,
				"phoneExists", phoneExists,
				"smsSent", smsSent,
				"validation", "PASSED"
			);
			
			return ResponseEntity.ok(result);
			
		} catch (Exception e) {
			logger.error("Debug phone registration error: {}", e.getMessage(), e);
			return ResponseEntity.badRequest().body(Map.of("error", "Debug failed: " + e.getMessage()));
		}
	}

	@PostMapping("/test-phone-format")
	public ResponseEntity<?> testPhoneFormat(@RequestBody Map<String, String> request) {
		try {
			String phone = request.get("phone");
			
			if (phone == null || phone.trim().isEmpty()) {
				return ResponseEntity.badRequest().body(Map.of("error", "Số điện thoại không được để trống"));
			}
			
			// Test format phone number
			String originalPhone = phone;
			String cleaned = phone.replaceAll("[^0-9]", "");
			
			String formattedPhone;
			if (cleaned.startsWith("0")) {
				formattedPhone = "+84" + cleaned.substring(1);
			} else if (cleaned.startsWith("84")) {
				formattedPhone = "+" + cleaned;
			} else if (!cleaned.startsWith("+")) {
				formattedPhone = "+" + cleaned;
			} else {
				formattedPhone = cleaned;
			}
			
			// Test SMS sending with both formats
			String testOtp = "123456";
			boolean smsSentOriginal = speedSmsService.sendOtpVia2FA(originalPhone, testOtp);
			boolean smsSentFormatted = speedSmsService.sendOtpVia2FA(formattedPhone, testOtp);
			
			Map<String, Object> result = Map.of(
				"originalPhone", originalPhone,
				"cleanedPhone", cleaned,
				"formattedPhone", formattedPhone,
				"smsSentOriginal", smsSentOriginal,
				"smsSentFormatted", smsSentFormatted,
				"phoneLength", cleaned.length(),
				"isValidFormat", cleaned.matches("^[0-9]{10,11}$")
			);
			
			return ResponseEntity.ok(result);
			
		} catch (Exception e) {
			logger.error("Test phone format error: {}", e.getMessage(), e);
			return ResponseEntity.badRequest().body(Map.of("error", "Test failed: " + e.getMessage()));
		}
	}

	@GetMapping("/server-ip")
	public ResponseEntity<?> getServerIp() {
		try {
			// Lấy IP local
			String localIp = java.net.InetAddress.getLocalHost().getHostAddress();
			
			// Lấy IP public (nếu có thể)
			String publicIp = "Unknown";
			try {
				java.net.URL url = new java.net.URL("http://checkip.amazonaws.com/");
				java.net.HttpURLConnection conn = (java.net.HttpURLConnection) url.openConnection();
				conn.setRequestMethod("GET");
				conn.setConnectTimeout(5000);
				conn.setReadTimeout(5000);
				
				if (conn.getResponseCode() == 200) {
					java.io.BufferedReader reader = new java.io.BufferedReader(
						new java.io.InputStreamReader(conn.getInputStream())
					);
					publicIp = reader.readLine().trim();
					reader.close();
				}
			} catch (Exception e) {
				logger.warn("Could not get public IP: {}", e.getMessage());
			}
			
			Map<String, Object> result = Map.of(
				"localIp", localIp,
				"publicIp", publicIp,
				"message", "Add these IPs to MOCEAN whitelist"
			);
			
			return ResponseEntity.ok(result);
		} catch (Exception e) {
			logger.error("Error getting server IP: {}", e.getMessage());
			return ResponseEntity.badRequest().body(Map.of("error", "Could not get server IP"));
		}
	}
}
