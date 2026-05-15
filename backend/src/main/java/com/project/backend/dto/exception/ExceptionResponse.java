package com.project.backend.dto.exception;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "ExceptionResponse", description = "DTO for returning error messages")
public class ExceptionResponse {

    @Schema(description = "List of error messages", example = "[\"Invalid request data\"]")
    private List<String> messages;

    public ExceptionResponse(String message) {
       this.messages = List.of(message);
    }

    public ExceptionResponse(List<String> messages) {
        this.messages = messages;
    }

}
