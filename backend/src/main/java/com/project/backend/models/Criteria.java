package com.project.backend.models;

import com.project.backend.models.join_tables.JurySubmissionCriteria;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "criteria", schema = "tournament")
@Getter
@Setter
@NoArgsConstructor
public class Criteria {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String text;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @OneToMany(mappedBy = "criteria", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<JurySubmissionCriteria> jurySubmissionCriteria = new HashSet<>();
}