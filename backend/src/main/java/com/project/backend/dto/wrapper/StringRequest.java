package com.project.backend.dto.wrapper;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "StringRequest", description = "DTO wrapping a single string value")
public class StringRequest {

    @Schema(description = "Text value", example = "Example text")
    private String text;
}
