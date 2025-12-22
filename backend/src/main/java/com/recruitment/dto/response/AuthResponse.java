package com.recruitment.dto.response;

import com.recruitment.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private UUID userId;
    private String email;
    private Role role;
    
    public AuthResponse(String token, UUID userId, String email, Role role) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.role = role;
    }
}
