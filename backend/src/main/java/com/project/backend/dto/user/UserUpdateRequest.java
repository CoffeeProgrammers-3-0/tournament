package com.project.backend.dto.user;

import com.project.backend.models.constants.Role;
import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private Role role;
}
