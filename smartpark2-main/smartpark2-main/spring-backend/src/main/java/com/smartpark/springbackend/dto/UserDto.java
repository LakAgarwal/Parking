package com.smartpark.springbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartpark.springbackend.model.User;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {

    @JsonProperty("_id")
    private Long id;

    private String username;

    private String email;

    private String role;

    public static UserDto fromEntity(User user) {
        return new UserDto(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
    }
}

