package com.recruitment.controller;

import com.recruitment.dto.request.JobSeekerLoginRequest;
import com.recruitment.dto.request.LoginRequest;
import com.recruitment.dto.request.RecruiterLoginRequest;
import com.recruitment.dto.request.RegisterRequest;
import com.recruitment.dto.response.AuthResponse;
import com.recruitment.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = userService.registerUser(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = userService.loginUser(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/recruiter/login")
    public ResponseEntity<AuthResponse> recruiterLogin(@Valid @RequestBody RecruiterLoginRequest request) {
        AuthResponse response = userService.loginRecruiter(request);
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/jobseeker/login")
    public ResponseEntity<AuthResponse> jobSeekerLogin(@Valid @RequestBody JobSeekerLoginRequest request) {
        AuthResponse response = userService.loginJobSeeker(request);
        return ResponseEntity.ok(response);
    }
}
