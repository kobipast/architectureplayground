package com.kobipast.userservice.api;

import com.kobipast.userservice.dto.AuthResponse;
import com.kobipast.userservice.dto.LoginRequest;
import com.kobipast.userservice.dto.RegisterRequest;
import com.kobipast.userservice.dto.UserDto;
import com.kobipast.userservice.mapper.UserMapper;
import com.kobipast.userservice.persistence.entity.User;
import com.kobipast.userservice.persistence.repository.UserRepository;
import com.kobipast.userservice.security.JwtService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Register request for email: {}", request.getEmail());

        // Check if user already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }

        // Create new user with encoded password
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        User user = new User(request.getName(), request.getEmail(), encodedPassword);
        user = userRepository.save(user);

        // Generate JWT token
        String token = jwtService.generateToken(user.getEmail());

        // Create response
        UserDto userDto = userMapper.toDto(user);
        AuthResponse response = new AuthResponse(token, userDto);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
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
        String token = jwtService.generateToken(user.getEmail());

        // Create response
        UserDto userDto = userMapper.toDto(user);
        AuthResponse response = new AuthResponse(token, userDto);

        return ResponseEntity.ok(response);
    }
}





