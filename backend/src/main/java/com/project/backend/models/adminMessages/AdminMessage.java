package com.project.backend.models.adminMessages;

import com.project.backend.models.User;
import com.project.backend.models.constants.AdminMessageTargetType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "admin_messages", schema = "tournament")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "target_type")
@Getter
@Setter
@NoArgsConstructor
public class AdminMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @Column(nullable = false)
    private Instant date;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, insertable = false, updatable = false)
    private AdminMessageTargetType targetType;

    private String content;

    private boolean isSystem;
}
