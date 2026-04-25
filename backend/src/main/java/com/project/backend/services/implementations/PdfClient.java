package com.project.backend.services.implementations;

import com.project.backend.exception.pdfWorker.PdfWorkerRateLimitException;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PdfClient {

    @Retryable(
            value = {PdfWorkerRateLimitException.class, RuntimeException.class},
            maxAttempts = 5,
            backoff = @Backoff(delay = 1000, multiplier = 2)
    )
    public byte[] send(String url, HttpEntity<?> request, RestTemplate restTemplate) {

        ResponseEntity<byte[]> response = restTemplate.postForEntity(
                url,
                request,
                byte[].class
        );

        if (response.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
            throw new PdfWorkerRateLimitException();
        }

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new RuntimeException("PDF worker failed: " + response.getStatusCode());
        }

        return response.getBody();
    }
}