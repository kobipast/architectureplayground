package com.kobipast.userservice.persistence.service;

import com.kobipast.userservice.dto.UserDto;
import com.kobipast.userservice.mapper.UserMapper;
import com.kobipast.userservice.persistence.entity.User;
import com.kobipast.userservice.persistence.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserMapper userMapper;

    private final UserRepository repository;

    public UserService(UserRepository repository, UserMapper userMapper) {
        this.repository = repository;
        this.userMapper = userMapper;
    }

    public List<User> getAll() {
        return repository.findAll();
    }

    public User getById(String id) {
        return repository.findById(id).orElseThrow();
    }

    public User create(String name, String email) {
        return repository.save(new User(name, email));
    }

    public User update(String id, String name, String email) {
        User user = getById(id);
        user.update(name, email);
        return repository.save(user);
    }

    public void delete(String id) {
        repository.deleteById(id);
    }

    public UserDto getByEmail(String email) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return userMapper.toDto(user);
    }
}
