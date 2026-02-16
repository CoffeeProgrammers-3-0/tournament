package com.project.backend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;



@Entity
@Table(schema = "tournament", name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 37, unique = true, nullable = false)
    @Size(max = 37)
    private String keycloakUserId;

    @Column(unique = true, nullable = false)
    @Size(max = 255)
    private String email;

    @Column(nullable = false, length = 100)
    @Size(max = 100)
    private String firstName;

    @Column(nullable = false, length = 100)
    @Size(max = 100)
    private String lastName;

    private String role;
}
