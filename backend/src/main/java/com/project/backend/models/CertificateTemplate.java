package com.project.backend.models;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(schema = "tournament", name = "certificate_templates")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class CertificateTemplate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "uploader_id")
    private User uploader;

    @OneToOne
    @JoinColumn(name = "file_id")
    private FileRepresentation file;

    @OneToMany(mappedBy = "certificateTemplate")
    @ToString.Exclude
    private Set<Certificate> certificates = new HashSet<>();

    private Instant createdAt;

    private String name;
}
