package com.project.backend.models;

import com.project.backend.models.constants.RoundEventType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "round_events", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class RoundEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne
    @JoinColumn(name = "creator_id")
    private User creator;

    @Column(nullable = false)
    private Instant startDate;
    @Column(nullable = false)
    private Instant endDate;
    @Column(nullable = false)
    private RoundEventType type;

    @Column(columnDefinition = "TEXT")
    private String description;
    private String title;
    private String location;
    private String platformUrl;
}