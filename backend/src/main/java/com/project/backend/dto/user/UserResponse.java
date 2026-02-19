package com.project.backend.dto.user;

import com.project.backend.models.constants.Role;
import lombok.Data;

@Data
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
}
