package com.kobipast.userservice.architecture;

import com.kobipast.userservice.persistence.entity.Role;
import com.kobipast.userservice.persistence.entity.User;
import com.kobipast.userservice.security.JwtService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;


import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc // Keep security enabled to validate RBAC behavior.
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ArchitectureControllerRbacWithJWTTest {

    @Autowired
    MockMvc mvc;
    @Autowired
    JwtService jwtService;
    @Autowired
    PasswordEncoder passwordEncoder;

    private User user;
    private User admin;

    private String userToken;
    private String adminToken;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private final String AUTH = "Authorization";

    @BeforeAll
    void setUpTokens() {
        String encodedPassword = passwordEncoder.encode("Te$t_PasW0rd!");
        user = new User("user", "user@example.com", encodedPassword, Role.USER);
        admin = new User("admin", "admin@example.com", encodedPassword, Role.ADMIN);
        userToken = "Bearer " + jwtService.generateToken(user);
        adminToken = "Bearer " + jwtService.generateToken(admin);

        when(userDetailsService.loadUserByUsername("user@example.com")).thenReturn(org.springframework.security.core.userdetails.User.builder().username(user.getEmail()).password(user.getPassword()).authorities("ROLE_" + user.getRole().name()).build());
        when(userDetailsService.loadUserByUsername("admin@example.com")).thenReturn(org.springframework.security.core.userdetails.User.builder().username(admin.getEmail()).password(admin.getPassword()).authorities("ROLE_" + admin.getRole().name()).build());
    }

    @Test
    void admin_whenAnonymous_returns401() throws Exception {
        // Endpoint requires authentication (and ADMIN role), so anonymous should be rejected.

        mvc.perform(get("/architecture/admin"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void admin_whenUserRole_returns403() throws Exception {
        // Authenticated but missing ADMIN role -> forbidden.

       mvc.perform(get("/architecture/admin")
                        .header(AUTH, userToken)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }

    @Test
    void admin_whenAdminRole_returns200() throws Exception {
        // ADMIN role satisfies @PreAuthorize("hasRole('ADMIN')").
        mvc.perform(get("/architecture/admin")
                        .header(AUTH, adminToken))
                .andExpect(status().isOk());
    }

    @Test
    void trace_whenAnonymous_returns401() throws Exception {
        // SecurityConfig requires authentication for any non-permitted endpoint.
        mvc.perform(get("/architecture/trace"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void trace_whenUserRole_returns200() throws Exception {
        // Any authenticated user should be allowed if there is no @PreAuthorize restriction.
        mvc.perform(get("/architecture/trace")
                        .header(AUTH, userToken))
                .andExpect(status().isOk());
    }

    @Test
    void trace_whenAdminRole_returns200() throws Exception {
        // ADMIN is also authenticated, so it should pass.
        mvc.perform(get("/architecture/trace")
                        .header(AUTH, adminToken))
                .andExpect(status().isOk());
    }
}
