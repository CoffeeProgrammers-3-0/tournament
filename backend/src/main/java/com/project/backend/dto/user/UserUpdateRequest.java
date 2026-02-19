package com.project.backend.dto.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String role;
}
