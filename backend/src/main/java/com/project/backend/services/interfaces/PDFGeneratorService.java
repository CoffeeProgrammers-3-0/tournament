package com.project.backend.services.interfaces;

import java.util.Map;

public interface PDFGeneratorService {
    byte[] generate(String html, Map<String, Object> values);
}
