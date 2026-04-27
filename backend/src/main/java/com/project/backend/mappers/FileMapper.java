package com.project.backend.mappers;

import com.project.backend.dto.file.FileResponse;
import com.project.backend.models.FileRepresentation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FileMapper {
    FileResponse fromFileRepresentationToResponse(FileRepresentation fileRepresentation);
}
