package com.project.backend.repositories;

import com.project.backend.models.Tournament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface TournamentRepository extends JpaRepository<Tournament, Long>, JpaSpecificationExecutor<Tournament> {
    // Переводимо з DRAFT у REGISTRATION, якщо настав час реєстрації
    @Modifying
    @Query("UPDATE Tournament t SET t.status = com.project.backend.models.constants.TournamentStatus.REGISTRATION " +
            "WHERE t.status = com.project.backend.models.constants.TournamentStatus.DRAFT " +
            "AND t.startRegistration <= :now")
    int startRegistrations(@Param("now") LocalDateTime now);

    // Переводимо з REGISTRATION у RUNNING, якщо настав час початку турніру
    @Modifying
    @Query("UPDATE Tournament t SET t.status = com.project.backend.models.constants.TournamentStatus.RUNNING " +
            "WHERE t.status = com.project.backend.models.constants.TournamentStatus.REGISTRATION " +
            "AND t.startTournament <= :now")
    int startTournaments(@Param("now") LocalDateTime now);
}
