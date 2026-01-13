package com.kobipast.userservice.api;

import com.kobipast.userservice.dto.AuthResponse;
import com.kobipast.userservice.dto.LoginRequest;
import com.kobipast.userservice.dto.RegisterRequest;
import com.kobipast.userservice.dto.UserDto;
import com.kobipast.userservice.mapper.UserMapper;
import com.kobipast.userservice.persistence.entity.RefreshToken;
import com.kobipast.userservice.persistence.entity.Role;
import com.kobipast.userservice.persistence.entity.User;
import com.kobipast.userservice.persistence.repository.UserRepository;
import com.kobipast.userservice.persistence.service.RefreshTokenService;
import com.kobipast.userservice.security.JwtService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserMapper userMapper;

    @Autowired
    private RefreshTokenService refreshTokenService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Create new user with encoded password
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getName(), request.getEmail(), encodedPassword, Role.USER);
        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtService.generateToken(user);

        RefreshToken rt = refreshTokenService.create(user);

        ResponseCookie refreshCookie = createRefreshCookie(rt);

        // Create response
        UserDto userDto = userMapper.toDto(user);
        AuthResponse response = new AuthResponse(token, userDto);

        return ResponseEntity.status(HttpStatus.CREATED).header(HttpHeaders.SET_COOKIE, refreshCookie.toString()).body(response);

    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        log.info("Login request for email: {}", request.getEmail());

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Get user from database
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate JWT token
        String token = jwtService.generateToken(user);

        // Create response
        UserDto userDto = userMapper.toDto(user);
        AuthResponse response = new AuthResponse(token, userDto);

        RefreshToken rt = refreshTokenService.create(user);

        ResponseCookie refreshCookie = createRefreshCookie(rt);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        try {
            String refreshToken = extractCookie(request, "refreshToken");
            if (refreshToken == null) {
                return unauthorizedWithCookieDeletion();
            }

            RefreshToken rt = refreshTokenService.verify(refreshToken);
            User user = rt.getUser();

            String newAccessToken = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(newAccessToken));

        } catch (Exception ex) {
            // any failure during refresh → 401 + delete cookie
            return unauthorizedWithCookieDeletion();
        }

    }

    private ResponseEntity<AuthResponse> unauthorizedWithCookieDeletion() {
        ResponseCookie delete = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)          // true in prod
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        return ResponseEntity.status(401)
                .header(HttpHeaders.SET_COOKIE, delete.toString())
                .build();
    }

    private String extractCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) return null;

        for (Cookie c : cookies) {
            if (name.equals(c.getName())) {
                return c.getValue();
            }
        }
        return null;
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        String token = extractCookie(request, "refreshToken");
        if (token != null) {
            refreshTokenService.deleteByToken(token); // תוסיף מתודה
        }

        ResponseCookie delete = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(false)
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, delete.toString())
                .build();
    }

    ResponseCookie createRefreshCookie (RefreshToken rt){
        return ResponseCookie.from("refreshToken", rt.getToken())
                .httpOnly(true)
                .secure(false)          // dev
                .path("/api/auth")
                .sameSite("Lax")
                .maxAge(Duration.ofDays(7))
                .build();
    }


}





