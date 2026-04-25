package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.templates.TemplateResponse;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.CertificateTemplateMapper;
import com.project.backend.models.CertificateTemplate;
import com.project.backend.services.interfaces.TemplateService;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/certificate-templates")
@Tag(name = "Certificate Templates", description = "API for managing certificate templates")
public class CertificateTemplateController {
    private final TemplateService templateService;
    private final CertificateTemplateMapper certificateTemplateMapper;
    private final CurrentUserContainer currentUserContainer;

    @GetMapping
    public PaginationListResponse<TemplateResponse> getTemplates(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Search query", example = "Winner")
            @RequestParam(value = "search", required = false) String search
    ){
        Page<CertificateTemplate> templates = templateService.findTemplates(page, size, search);

        PaginationListResponse<TemplateResponse> response = new PaginationListResponse<>();

        response.setTotalPages(templates.getTotalPages());
        response.setContent(templates.getContent().stream()
                .map(certificateTemplateMapper::fromCertificateTemplateToResponse)
                .toList());

        return response;
    }

    @PostMapping
    public TemplateResponse uploadTemplate(@RequestParam MultipartFile file, @RequestParam(required = false, value = "name") String name) {
        log.info("Controller: upload template file");
        return certificateTemplateMapper.fromCertificateTemplateToResponse(templateService.upload(file, currentUserContainer.getUser(), name == null ? file.getName() : name));
    }
}
