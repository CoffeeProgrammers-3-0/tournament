package com.project.backend.repositories;

import com.project.backend.models.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface TournamentRepository extends JpaRepository<Tournament, Long>, JpaSpecificationExecutor<Tournament> {
}
