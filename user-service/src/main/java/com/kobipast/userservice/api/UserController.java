package com.kobipast.userservice.api;

import com.kobipast.userservice.dto.CreateUserRequest;
import com.kobipast.userservice.dto.UpdateUserRequest;
import com.kobipast.userservice.dto.UserDto;
import com.kobipast.userservice.mapper.UserMapper;
import com.kobipast.userservice.persistence.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private static final Logger log =
            LoggerFactory.getLogger(UserController.class);

    private UserService userService;

    private UserMapper userMapper;

    public UserController(UserService service, UserMapper userMapper) {
        this.userService = service;
        this.userMapper = userMapper;
    }

    // GET /users
    @GetMapping
    public List<UserDto> getAllUsers() {

        /*return List.of(
                new UserDto("1", "Alice", "alice@test.com"),
                new UserDto("2", "Bob", "bob@test.com")
        );*/
        return userMapper.toDtoList(userService.getAll());
    }

    // GET /users/{id}
    @GetMapping("/{id}")
    public UserDto getUserById(@PathVariable String id) {
        return new UserDto(id, "Dummy User", "dummy@test.com");
    }

    // POST /users
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserDto createUser(@RequestBody CreateUserRequest request) {
        log.info("POST /create user: {} {}", request.getName(), request.getEmail());
        return userMapper.toDto(userService.create(request.getName(), request.getEmail()));
    }

    // PUT /users/{id}
    @PutMapping("/{id}")
    public UserDto updateUser(
            @PathVariable String id,
            @RequestBody UpdateUserRequest request
    ) {
        return new UserDto(
                id,
                request.getName(),
                request.getEmail()
        );
    }

    // DELETE /users/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable String id) {
        // no-op (dummy)
    }
}
