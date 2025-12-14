package com.kobipast.userservice.persistence.repository;


import com.kobipast.userservice.persistence.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}