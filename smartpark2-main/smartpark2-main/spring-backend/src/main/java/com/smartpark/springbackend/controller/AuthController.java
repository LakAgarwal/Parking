package com.smartpark.springbackend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.smartpark.springbackend.dto.AuthResponse;
import com.smartpark.springbackend.dto.LoginRequest;
import com.smartpark.springbackend.dto.SignupRequest;
import com.smartpark.springbackend.service.UserService;

@RestController
@RequestMapping("/api/v1/user")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Validated @RequestBody SignupRequest request) {
        AuthResponse response = userService.register(request);
        return ResponseEntity.status(response.isSucess() ? 201 : 400).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Validated @RequestBody LoginRequest request) {
        AuthResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }
}

