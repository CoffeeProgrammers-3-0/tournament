package com.project.backend.services.implementations;

import com.project.backend.services.interfaces.PDFGeneratorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PDFGeneratorServiceImpl implements PDFGeneratorService {

    @Qualifier("stringTemplateEngine")
    private final TemplateEngine templateEngine;
    private final PdfClient pdfClient;

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${pdf.worker.url}")
    private String pdfWorkerUrl;

    @Override
    public byte[] generate(String htmlTemplate, Map<String, Object> values) {
        Context context = new Context();
        context.setVariables(values);

        String processedHtml = templateEngine.process(htmlTemplate, context);

        Document doc = Jsoup.parse(processedHtml, "UTF-8");

        doc.outputSettings().syntax(Document.OutputSettings.Syntax.xml);
        doc.outputSettings().escapeMode(org.jsoup.nodes.Entities.EscapeMode.xhtml);

        String finalHtml = doc.html();

        log.info("Generated HTML ready for PDF worker");

        return sendToPdfWorker(finalHtml);
    }

    private byte[] sendToPdfWorker(String html) {

        String url = pdfWorkerUrl + "/pdf";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, String> body = Map.of("html", html);

        HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

        return pdfClient.send(url, request, restTemplate);
    }
}