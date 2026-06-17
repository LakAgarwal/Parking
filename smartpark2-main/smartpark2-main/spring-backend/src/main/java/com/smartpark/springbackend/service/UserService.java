package com.smartpark.springbackend.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.smartpark.springbackend.dto.AuthResponse;
import com.smartpark.springbackend.dto.LoginRequest;
import com.smartpark.springbackend.dto.SignupRequest;
import com.smartpark.springbackend.dto.UserDto;
import com.smartpark.springbackend.model.User;
import com.smartpark.springbackend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse register(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            return new AuthResponse(false, "user already exists", null, null);
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("user");

        User saved = userRepository.save(user);

        UserDto dto = UserDto.fromEntity(saved);
        String token = "dummy-token";

        return new AuthResponse(true, "New User Created", dto, token);
    }

    public AuthResponse login(LoginRequest request) {
        return userRepository.findByEmail(request.getEmail())
                .map(user -> {
                    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
                        return new AuthResponse(false, "Invalid username or password", null, null);
                    }
                    UserDto dto = UserDto.fromEntity(user);
                    String token = "dummy-token";
                    return new AuthResponse(true, "login sucessfully", dto, token);
                })
                .orElseGet(() -> new AuthResponse(false, "email is not registered", null, null));
    }
}

