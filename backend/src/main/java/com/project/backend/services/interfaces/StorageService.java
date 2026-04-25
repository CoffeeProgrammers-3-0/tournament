package com.project.backend.services.interfaces;

public interface StorageService {
    String uploadFile(String fileName, byte[] fileBytes, String contentType);
    void deleteFile(String fileName);
    String getPublicUrl(String fileName);
    String readAsString(String path);
}
