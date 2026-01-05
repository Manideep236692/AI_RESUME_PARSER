package com.recruitment.service;

import com.recruitment.dto.request.JobSeekerLoginRequest;
import com.recruitment.dto.request.LoginRequest;
import com.recruitment.dto.request.RecruiterLoginRequest;
import com.recruitment.dto.request.RegisterRequest;
import com.recruitment.dto.response.AuthResponse;
import com.recruitment.entity.*;
import com.recruitment.repository.JobSeekerRepository;
import com.recruitment.repository.RecruiterRepository;
import com.recruitment.repository.UserRepository;
import com.recruitment.security.UserPrincipal;
import com.recruitment.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final RecruiterRepository recruiterRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        if (request.getRole() == Role.JOB_SEEKER) {
            String fullName = request.getFirstName() + " " + request.getLastName();
            if (fullName.trim().isEmpty()) {
                fullName = "Job Seeker";
            }
            user.setFullName(fullName);
        } else if (request.getRole() == Role.RECRUITER) {
            String fullName = request.getCompanyName();
            if (fullName == null || fullName.trim().isEmpty()) {
                fullName = "Recruiter";
            }
            user.setFullName(fullName);
        }

        user = userRepository.save(user);

        if (request.getRole() == Role.JOB_SEEKER) {
            JobSeeker jobSeeker = new JobSeeker();
            jobSeeker.setUser(user);
            jobSeeker.setFirstName(request.getFirstName());
            jobSeeker.setLastName(request.getLastName());
            jobSeeker.setPhone(request.getPhone());
            jobSeeker.setLocation(request.getLocation());

            jobSeekerRepository.save(jobSeeker);
        } else if (request.getRole() == Role.RECRUITER) {
            Recruiter recruiter = new Recruiter();
            recruiter.setUser(user);
            recruiter.setCompanyName(request.getCompanyName());
            recruiter.setCompanyDescription(request.getCompanyDescription());
            recruiter.setCompanySize(request.getCompanySize());

            recruiterRepository.save(recruiter);
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getRole());
    }

    public AuthResponse loginUser(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(java.util.Objects.requireNonNull(userDetails.getId()))
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getRole());
    }

    public AuthResponse loginRecruiter(RecruiterLoginRequest request) {
        // First verify the user exists and has the correct role
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (user.getRole() != Role.RECRUITER) {
            throw new BadCredentialsException("This login is only for recruiters");
        }

        // Proceed with authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getRole());
    }

    public AuthResponse loginJobSeeker(JobSeekerLoginRequest request) {
        // First verify the user exists and has the correct role
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (user.getRole() != Role.JOB_SEEKER) {
            throw new BadCredentialsException("This login is only for job seekers");
        }

        // Proceed with authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        return new AuthResponse(jwt, user.getId(), user.getEmail(), user.getRole());
    }
}
