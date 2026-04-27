package com.project.backend.mappers;

import com.project.backend.dto.certificate.CertificateResponse;
import com.project.backend.models.Certificate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {CertificateTemplateMapper.class, UserMapper.class, FileMapper.class})
public interface CertificateMapper {
    CertificateResponse fromCertificateToResponse(Certificate certificate);
}
