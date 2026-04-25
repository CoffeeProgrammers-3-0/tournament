package com.project.backend.services.implementations;

import com.project.backend.models.FileRepresentation;
import com.project.backend.models.User;
import com.project.backend.repositories.FileRepresentationRepository;
import com.project.backend.repositories.specifications.FileRepresentationSpecification;
import com.project.backend.services.interfaces.FileService;
import com.project.backend.services.interfaces.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FileServiceImpl implements FileService {

    private final FileRepresentationRepository fileRepository;
    private final StorageService storageService;

    @SneakyThrows
    @Override
    public FileRepresentation save(MultipartFile file, User uploader) {

        String originalFilename = file.getOriginalFilename();
        String realFileName = createName(originalFilename);
        String publicUrl = storageService.uploadFile(realFileName, file.getBytes(), file.getContentType());;

        FileRepresentation entity = new FileRepresentation();
        entity.setFileName(realFileName);
        entity.setFileRealName(originalFilename);
        entity.setUploader(uploader);
        entity.setFileType(file.getContentType());
        entity.setFileSize(String.valueOf(file.getSize()));
        entity.setPath(publicUrl);
        entity.setUploadDate(Instant.now());

        return fileRepository.save(entity);
    }

    private String createName(String originalName){
        String realFileName = originalName;
        String pre_UUID = String.valueOf(UUID.randomUUID());

        realFileName = Normalizer.normalize(Objects.requireNonNull(realFileName), Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        realFileName = realFileName.replaceAll("[^a-zA-Z0-9._-]", "_");

        return  pre_UUID + realFileName;
    }

    @Override
    public Page<FileRepresentation> findByUserId(Long userId, int page, int size) {
        log.info("Service: Find files by user id {}", userId);
        return fileRepository.findAll(FileRepresentationSpecification.byUploaderId(userId), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "uploadDate")));
    }

    @Override
    public FileRepresentation saveGenerated(byte[] file,
                                            User user,
                                            String originalFileName,
                                            String fileType) {
        log.info("Service: Saving generated file {}", originalFileName);

        String realFileName = createName(originalFileName);
        String publicUrl = storageService.uploadFile(
                realFileName,
                file,
                fileType
        );


        FileRepresentation entity = new FileRepresentation();
        entity.setFileName(realFileName);
        entity.setFileRealName(originalFileName);
        entity.setUploader(user);
        entity.setFileType(fileType);
        entity.setFileSize(String.valueOf(file.length));
        entity.setPath(publicUrl);
        entity.setUploadDate(Instant.now());

        return fileRepository.save(entity);
    }

    @Override
    public void delete(Long id) {
        log.info("Service: Delete file with id {}", id);
        FileRepresentation file = fileRepository.findById(id).orElseThrow();
        String filename = file.getFileName();
        log.info("Service: Delete file with id {}", filename);
        storageService.deleteFile(filename);
        fileRepository.deleteById(id);
    }
}
