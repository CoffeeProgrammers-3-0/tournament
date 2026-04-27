package com.project.backend.services.implementations;

import com.project.backend.models.Certificate;
import com.project.backend.models.CertificateTemplate;
import com.project.backend.models.FileRepresentation;
import com.project.backend.models.User;
import com.project.backend.models.constants.CertificateStatus;
import com.project.backend.repositories.UserRepository;
import com.project.backend.services.interfaces.FileService;
import com.project.backend.services.interfaces.PDFGeneratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class CertificateAsyncWorker {

    private final PDFGeneratorService pdfGeneratorService;
    private final FileService fileService;
    private final UserRepository userRepository;

    @Async("certificateExecutor")
    public CompletableFuture<Certificate> generate(
            User creator,
            CertificateTemplate template,
            String templateContent,
            Long userId,
            Map<String, Object> data
    ) {
        byte[] pdf = pdfGeneratorService.generate(templateContent, data);

        FileRepresentation file = fileService.saveGenerated(
                pdf,
                creator,
                data.get("fullName") + ".pdf",
                "application/pdf"
        );

        Certificate cert = new Certificate();
        cert.setFile(file);
        cert.setStatus(CertificateStatus.DRAFT);
        cert.setCreator(creator);
        cert.setReceiver(userRepository.findById(userId).orElse(null));
        cert.setCertificateTemplate(template);
        cert.setCreatedAt(Instant.now());

        return CompletableFuture.completedFuture(cert);
    }
}