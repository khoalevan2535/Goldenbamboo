package com.poly.restaurant.config;

import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.entities.RoleEntity;
import com.poly.restaurant.entities.enums.AccountStatus;
import com.poly.restaurant.repositories.AccountRepository;
import com.poly.restaurant.repositories.RoleRepository;
import com.poly.restaurant.services.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.ResponseCookie;

@Component
@RequiredArgsConstructor
public class CustomOAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService jwtService;
    private final AccountRepository accountRepository;
    private final RoleRepository roleRepository; // ✅ Thêm repository để lấy ROLE_USER

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        try {
            OAuth2User user = (OAuth2User) authentication.getPrincipal();
            String email = user.getAttribute("email");
            String name = user.getAttribute("name");
            String picture = user.getAttribute("picture"); // Lấy avatar từ Google

            System.out.println("OAuth2 Success - Email: " + email + ", Name: " + name + ", Picture: " + picture);

            // Tìm hoặc tạo user mới
            AccountEntity account = accountRepository.findByEmail(email)
                    .orElseGet(() -> {
                        System.out.println("Creating new OAuth2 account for email: " + email);
                        AccountEntity newAccount = new AccountEntity();
                        newAccount.setEmail(email);
                        newAccount.setName(name);
                        newAccount.setAvatarUrl(picture); // Lưu avatar từ Google
                        newAccount.setStatus(AccountStatus.ACTIVE);

                        // ✅ Gán ROLE_USER mặc định
                        RoleEntity userRole = roleRepository.findByName("ROLE_USER")
                                .orElseThrow(() -> new RuntimeException("Vai trò ROLE_USER không tồn tại"));
                        newAccount.setRole(userRole);

                        AccountEntity saved = accountRepository.save(newAccount);
                        System.out.println("OAuth2 account created with ID: " + saved.getId());
                        return saved;
                    });
            
            // Cập nhật avatar nếu tài khoản đã tồn tại nhưng chưa có avatar
            if (account.getAvatarUrl() == null || account.getAvatarUrl().isEmpty()) {
                account.setAvatarUrl(picture);
                accountRepository.save(account);
                System.out.println("Updated existing account with Google avatar");
            }

            System.out.println("OAuth2 account found/created - ID: " + account.getId() + ", Role: " + 
                             (account.getRole() != null ? account.getRole().getName() : "NULL"));

            // Sinh JWT
            String accessToken = jwtService.generateToken(account);
            String refreshToken = jwtService.generateRefreshToken(account);

            System.out.println("OAuth2 tokens generated successfully");

            // Set refresh token vào httpOnly cookie (giống như login thông thường)
            ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshToken)
                    .httpOnly(true).secure(false).sameSite("Lax").path("/api/auth")
                    .build();
            response.addHeader("Set-Cookie", cookie.toString());

            // Redirect về React kèm token
            String redirectUrl = String.format(
                    "http://localhost:5173/oauth2/success?accessToken=%s&refreshToken=%s",
                    accessToken, refreshToken
            );

            System.out.println("Redirecting to: " + redirectUrl);
            getRedirectStrategy().sendRedirect(request, response, redirectUrl);
        } catch (Exception e) {
            System.err.println("OAuth2 Success Handler Error: " + e.getMessage());
            e.printStackTrace();
            // Redirect to error page
            response.sendRedirect("http://localhost:5173/login?error=oauth_failed");
        }
    }
}
