package com.poly.restaurant.config;

import com.poly.restaurant.entities.AccountEntity;
import com.poly.restaurant.repositories.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;

@Configuration
@RequiredArgsConstructor
public class ApplicationConfig {

    private final AccountRepository accountRepository;

    @Bean
    public UserDetailsService userDetailsService() {
        return identifier -> {
            // System.out.println("UserDetailsService - Looking for user with identifier: " + identifier);
            
            // Try to find user with role loaded
            var user = accountRepository.findByUsernameWithRole(identifier)
                    .or(() -> accountRepository.findByEmailWithRole(identifier))
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));
            
            // System.out.println("UserDetailsService - Found user: " + user.getUsername());
            // System.out.println("UserDetailsService - User role: " + (user.getRole() != null ? user.getRole().getName() : "NULL"));
            // System.out.println("UserDetailsService - User authorities: " + user.getAuthorities());
            // System.out.println("UserDetailsService - User has password: " + (user.getPassword() != null && !user.getPassword().isEmpty()));
            
            return user;
        };
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        return new AuthenticationProvider() {
            @Override
            public Authentication authenticate(Authentication authentication) throws AuthenticationException {
                String identifier = authentication.getName();
                String password = authentication.getCredentials().toString();
                
                // System.out.println("Custom AuthProvider - Authenticating: " + identifier);
                
                // Load user details
                UserDetails userDetails = userDetailsService().loadUserByUsername(identifier);
                
                if (userDetails instanceof AccountEntity) {
                    AccountEntity account = (AccountEntity) userDetails;
                    
                    // Kiểm tra nếu là tài khoản OAuth2 (không có password)
                    if (account.getPassword() == null || account.getPassword().isEmpty()) {
                        System.out.println("OAuth2 account detected - redirecting to set password");
                        // Tài khoản OAuth2 - từ chối đăng nhập và yêu cầu đặt password
                        // Không cần kiểm tra password, luôn chuyển hướng đến đặt mật khẩu
                        throw new BadCredentialsException("OAUTH2_NO_PASSWORD");
                    }
                }
                
                // Tài khoản thường - kiểm tra password
                if (!passwordEncoder().matches(password, userDetails.getPassword())) {
                    throw new BadCredentialsException("Tài khoản hoặc mật khẩu không đúng vui lòng kiểm tra lại");
                }
                
                if (!userDetails.isEnabled()) {
                    throw new DisabledException("User account is disabled");
                }
                if (!userDetails.isAccountNonLocked()) {
                    throw new LockedException("User account is locked");
                }
                
                return new UsernamePasswordAuthenticationToken(
                    userDetails, null, userDetails.getAuthorities());
            }
            
            @Override
            public boolean supports(Class<?> authentication) {
                return UsernamePasswordAuthenticationToken.class.isAssignableFrom(authentication);
            }
        };
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder() {
            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                // Nếu encodedPassword là null hoặc rỗng (tài khoản OAuth2), luôn trả về false
                if (encodedPassword == null || encodedPassword.isEmpty()) {
                    return false;
                }
                return super.matches(rawPassword, encodedPassword);
            }
        };
    }
}