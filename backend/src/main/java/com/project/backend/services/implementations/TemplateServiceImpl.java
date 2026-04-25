package com.project.backend.services.implementations;

import com.project.backend.models.CertificateTemplate;
import com.project.backend.models.User;
import com.project.backend.repositories.CertificateTemplateRepository;
import com.project.backend.repositories.specifications.CertificateTemplateSpecification;
import com.project.backend.services.interfaces.FileService;
import com.project.backend.services.interfaces.TemplateService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class TemplateServiceImpl implements TemplateService {

    private final FileService fileService;
    private final CertificateTemplateRepository certificateTemplateRepository;

    @Override
    public CertificateTemplate upload(MultipartFile file,
                                      User uploader,
                                      String name
    ) {
        CertificateTemplate template = new CertificateTemplate();
        template.setUploader(uploader);
        template.setName(name);
        template.setCreatedAt(Instant.now());
        template.setFile(fileService.save(file, uploader));
        return certificateTemplateRepository.save(template);
    }

    @Override
    public Page<CertificateTemplate> findTemplates(Integer page, Integer size, String search) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));
        return certificateTemplateRepository.findAll(CertificateTemplateSpecification.byName(search), pageRequest);
    }

    @Override
    public CertificateTemplate findById(Long id) {
        return certificateTemplateRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Certificate template with id " + id + " not found"));
    }

    @Override
    public void delete(Long id) {
        CertificateTemplate template = findById(id);
        certificateTemplateRepository.deleteById(id);
        fileService.delete(template.getFile().getId());
    }
}
