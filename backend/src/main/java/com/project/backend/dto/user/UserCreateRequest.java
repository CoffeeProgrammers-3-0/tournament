package com.project.backend.dto.user;

import lombok.Data;

@Data
public class UserCreateRequest {
    private String fullName;
    private String email;
}
