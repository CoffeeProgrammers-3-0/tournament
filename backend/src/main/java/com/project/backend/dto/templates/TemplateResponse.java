package com.project.backend.dto.templates;

import com.project.backend.dto.file.FileResponse;
import com.project.backend.dto.user.UserResponse;
import lombok.Data;

import java.time.Instant;

@Data
public class TemplateResponse {
    private Long id;
    private UserResponse uploader;
    private FileResponse file;
    private Instant createdAt;
    private String name;
}
