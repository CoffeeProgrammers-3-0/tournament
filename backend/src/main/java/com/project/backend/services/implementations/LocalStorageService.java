package com.project.backend.services.implementations;


import com.project.backend.services.interfaces.StorageService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Slf4j
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {
    @Value("${storage.local.path}")
    private String storagePath;

    @Override
    public String uploadFile(String fileName, byte[] fileBytes, String contentType) {
        log.info("Upload to local storage: {}", fileName);

        try {
            Path dir = Paths.get(storagePath);
            Files.createDirectories(dir);

            Path filePath = dir.resolve(fileName);
            Files.write(filePath, fileBytes);

            return getPublicUrl(fileName);
        } catch (IOException e) {
            throw new RuntimeException("Local upload failed", e);
        }
    }

    @Override
    public void deleteFile(String fileName) {
        log.info("Delete from local storage: {}", fileName);
        try {
            Files.deleteIfExists(Paths.get(storagePath, fileName));
        } catch (IOException e) {
            throw new RuntimeException("Local delete failed", e);
        }
    }

    @Override
    public String getPublicUrl(String fileName) {
        return "/files/" + fileName;
    }

    @Override
    public String readAsString(String path)  {
        try {
            return Files.readString(Path.of(path));
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
