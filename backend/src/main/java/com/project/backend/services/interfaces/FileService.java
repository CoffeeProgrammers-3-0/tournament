package com.project.backend.services.interfaces;

import com.project.backend.models.FileRepresentation;
import com.project.backend.models.User;
import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    FileRepresentation save(MultipartFile file, User owner);
    void delete(Long id);
    Page<FileRepresentation> findByUserId(Long userId, int page, int size);
    FileRepresentation saveGenerated(byte[] file,
                                     User user,
                                     String originalFileName,
                                     String fileType);
}
