package com.project.backend.controllers;


import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.certificate.CertificateResponse;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.CertificateMapper;
import com.project.backend.models.Certificate;
import com.project.backend.models.User;
import com.project.backend.models.constants.CertificateStatus;
import com.project.backend.services.interfaces.CertificateService;
import com.project.backend.services.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/certificates")
@Tag(name = "Certificates", description = "API for managing certificates")
public class CertificateController {

    private final CertificateService certificateService;
    private final CertificateMapper certificateMapper;
    private final CurrentUserContainer currentUserContainer;
    private final UserService userService;

    @PostMapping("/generate/single")
    @Operation(summary = "Generate a single certificate", description = "Creates a certificate based on a template and provided data")
    public CertificateResponse generateCertificate(
            @RequestParam Long templateId,
            @RequestParam String fileName,
            @RequestBody Map<String, Object> data,
            @RequestParam(value = "receiverId") Long receiverId
    ) {
        log.info("Request to generate certificate for template: {}", templateId);
        User currentUser = currentUserContainer.getUser();
        User receiver = userService.findById(receiverId);
        Certificate certificate = certificateService.generateCertificate(currentUser, receiver, templateId, fileName, data);
        return certificateMapper.fromCertificateToResponse(certificate);
    }

    @PostMapping("/generate/teams")
    @Operation(summary = "Generate certificates for all teams in a round")
    public List<CertificateResponse> generateCertificatesForTeams(
            @RequestParam Long templateId,
            @RequestParam Long roundId
    ) {
        log.info("Request to generate certificates for all teams in round: {}", roundId);
        User currentUser = currentUserContainer.getUser();
        return certificateService.generateCertificatesForTeams(currentUser, templateId, roundId).stream().map(certificateMapper::fromCertificateToResponse).toList();
    }

    @PostMapping("/generate/teams-batch")
    @Operation(summary = "Generate certificates for specific teams")
    public List<CertificateResponse> generateCertificatesForSpecificTeams(
            @RequestParam Long templateId,
            @RequestParam Long roundId,
            @RequestBody List<Long> teamIds
    ) {
        log.info("Request to generate certificates for specific teams in round: {}", roundId);
        User currentUser = currentUserContainer.getUser();
        return certificateService.generateCertificatesForTeams(currentUser, templateId, roundId, teamIds).stream().map(certificateMapper::fromCertificateToResponse).toList();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get certificate metadata by ID")
    public CertificateResponse getCertificateMeta(@PathVariable Long id) {
        log.info("Fetching metadata for certificate ID: {}", id);
        return certificateMapper.fromCertificateToResponse(certificateService.getCertificateMetaById(id));
    }

    @GetMapping("/my")
    public PaginationListResponse<CertificateResponse> getMyCertificates(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size
    ) {
        User user = currentUserContainer.getUser();
        Page<Certificate> certificates = certificateService.findCertificatesByReceiver(user.getId(), page, size);
        PaginationListResponse<CertificateResponse> response = new PaginationListResponse<>();

        response.setTotalPages(certificates.getTotalPages());
        response.setContent(certificates.getContent().stream()
                .map(certificateMapper::fromCertificateToResponse)
                .toList());

        return response;
    }

    @GetMapping("/created-by-me")
    public PaginationListResponse<CertificateResponse> getCreatedByMeCertificates(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size
    ) {
        User user = currentUserContainer.getUser();
        Page<Certificate> certificates = certificateService.findCertificatesByCreator(user.getId(), page, size);
        PaginationListResponse<CertificateResponse> response = new PaginationListResponse<>();

        response.setTotalPages(certificates.getTotalPages());
        response.setContent(certificates.getContent().stream()
                .map(certificateMapper::fromCertificateToResponse)
                .toList());

        return response;
    }

    @GetMapping
    public PaginationListResponse<CertificateResponse> getCertificates(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size
    ) {
        User user = currentUserContainer.getUser();
        Page<Certificate> certificates = certificateService.findAll(page, size);
        PaginationListResponse<CertificateResponse> response = new PaginationListResponse<>();

        response.setTotalPages(certificates.getTotalPages());
        response.setContent(certificates.getContent().stream()
                .map(certificateMapper::fromCertificateToResponse)
                .toList());

        return response;
    }

    @GetMapping("/user/{user_id}")
    public PaginationListResponse<CertificateResponse> getUsersCertificates(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "User id", example = "12")
            @PathVariable(value = "user_id") Long userId
    ) {
        Page<Certificate> certificates = certificateService.findCertificatesByReceiver(userId, page, size);
        PaginationListResponse<CertificateResponse> response = new PaginationListResponse<>();

        response.setTotalPages(certificates.getTotalPages());
        response.setContent(certificates.getContent().stream()
                .map(certificateMapper::fromCertificateToResponse)
                .toList());

        return response;
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update certificate status")
    public CertificateResponse updateStatus(
            @PathVariable Long id,
            @RequestParam CertificateStatus status
    ) {
        log.info("Updating status for certificate ID: {} to {}", id, status);
        return certificateMapper.fromCertificateToResponse(certificateService.updateCertificateStatus(id, status));
    }
}
