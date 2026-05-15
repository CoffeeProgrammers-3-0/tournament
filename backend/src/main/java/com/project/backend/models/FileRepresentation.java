package com.project.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(schema = "tournament", name = "files")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class FileRepresentation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @ManyToOne
    @JoinColumn(name = "uploader_id")
    private User uploader;
    private String path;
    private String fileName;
    private String fileSize;
    private String fileType;
    private Instant uploadDate;
    private String fileRealName;
}