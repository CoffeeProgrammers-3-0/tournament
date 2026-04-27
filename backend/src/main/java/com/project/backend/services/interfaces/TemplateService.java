package com.project.backend.services.interfaces;

import com.project.backend.models.CertificateTemplate;
import com.project.backend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface TemplateService {
    CertificateTemplate upload(MultipartFile file, User uploader, String name);
    Page<CertificateTemplate> findTemplates(Integer page, Integer size, String search);
    CertificateTemplate findById(Long id);
    void delete(Long id);
}
