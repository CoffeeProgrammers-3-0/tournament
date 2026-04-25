package com.project.backend.models;

import com.project.backend.models.constants.CertificateStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(schema = "tournament", name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Certificate {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @OneToOne
    @JoinColumn(name = "file_id")
    private FileRepresentation file;

    @ManyToOne
    @JoinColumn(name = "certificate_template_id")
    private CertificateTemplate certificateTemplate;

    private Instant createdAt;

    @Enumerated(EnumType.STRING)
    private CertificateStatus status;
}
