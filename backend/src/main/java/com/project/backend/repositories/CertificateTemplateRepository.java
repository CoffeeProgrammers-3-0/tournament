package com.project.backend.repositories;

import com.project.backend.models.CertificateTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CertificateTemplateRepository extends JpaRepository<CertificateTemplate, Long>, JpaSpecificationExecutor<CertificateTemplate> {
}
