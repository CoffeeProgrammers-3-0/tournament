package com.project.backend.dto.wrapper;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(name = "LongDTO", description = "DTO wrapping a single long value")
public class LongDTO {

    @Schema(description = "Long value", example = "123")
    private Long value;
}
