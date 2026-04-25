package com.project.backend.mappers;

import com.project.backend.dto.templates.TemplateResponse;
import com.project.backend.models.CertificateTemplate;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {FileMapper.class, UserMapper.class})
public interface CertificateTemplateMapper {
    TemplateResponse fromCertificateTemplateToResponse(CertificateTemplate template);
}
