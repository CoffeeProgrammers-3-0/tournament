package com.project.backend.models;

import com.fasterxml.jackson.databind.JsonNode;
import com.project.backend.models.constants.NotificationKey;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(schema = "tournament", name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private User receiver;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private NotificationKey key;

    @Column(columnDefinition = "jsonb", nullable = false)
    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode payload;

    @Column(nullable = false)
    private boolean seen;

    @Column(nullable = false)
    private LocalDateTime date;

    @PrePersist
    void prePersist() {
        if(date == null) {
            date = LocalDateTime.now();
        }
    }
}
