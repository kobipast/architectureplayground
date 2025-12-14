package com.kobipast.userservice.mapper;


import com.kobipast.userservice.dto.UserDto;
import com.kobipast.userservice.persistence.entity.User;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserMapper {

    public List<UserDto> toDtoList(List<User> userList){
        return userList.stream()
                .map(user -> new UserDto(
                        user.getId(),
                        user.getName(),
                        user.getEmail()
                ))
                .toList();
    }

    public UserDto toDto(User user) {
        return new UserDto(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }

}
