package com.project.backend.dto.certificate;

import com.project.backend.dto.file.FileResponse;
import com.project.backend.dto.templates.TemplateResponse;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.models.constants.CertificateStatus;
import lombok.Data;

import java.time.Instant;

@Data
public class CertificateResponse {
    private Long id;
    private UserResponse receiver;
    private UserResponse creator;
    private FileResponse file;
    private TemplateResponse certificateTemplate;
    private Instant createdAt;
    private CertificateStatus status;
}
