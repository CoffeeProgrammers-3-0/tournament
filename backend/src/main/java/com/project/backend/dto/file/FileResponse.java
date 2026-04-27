package com.project.backend.dto.file;

import lombok.Data;

@Data
public class FileResponse {
    private long id;
    private String fileRealName;
    private String fileType;
    private String path;
}
