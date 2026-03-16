package com.project.backend.dto.wrapper;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(name = "PaginationListResponse", description = "Generic DTO for paginated list responses")
public class PaginationListResponse<T> {

    @Schema(description = "Total number of pages", example = "5")
    private Integer totalPages;

    @Schema(description = "Content of the current page")
    private List<T> content;
}
