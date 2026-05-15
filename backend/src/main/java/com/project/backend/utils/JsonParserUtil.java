package com.project.backend.utils;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public class JsonParserUtil {

    private static final ObjectMapper mapper = new ObjectMapper();

    public static List<String> extractErrorMessages(String json) {
        List<String> messages = new ArrayList<>();

        log.info("notExtractErrorMessages: {}", json);

        try {
            JsonNode root = mapper.readTree(json);

            if (root.has("errors")) {
                for (JsonNode node : root.get("errors")) {
                    if (node.has("errorMessage")) {
                        messages.add(node.get("errorMessage").asText());
                    }
                }
            } else if (root.has("errorMessage")) {
                messages.add(root.get("errorMessage").asText());
            }

        } catch (Exception e) {
            messages.add("Unexpected error format");
        }

        log.info("Extracted error messages: {}", messages);

        return messages;
    }
}
