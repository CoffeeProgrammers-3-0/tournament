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

    @Modifying
    @Query("UPDATE Tournament t SET t.status = com.project.backend.models.constants.TournamentStatus.FINISHED " +
            "WHERE t.status = com.project.backend.models.constants.TournamentStatus.RUNNING " +
            // Умова 1: Кількість раундів досягла максимуму
            "AND t.countOfRounds = (SELECT COUNT(r) FROM Round r WHERE r.tournament = t) " +
            // Умова 2: Усі раунди цього турніру мають статус EVALUATED (немає жодного НЕ оціненого)
            "AND NOT EXISTS (SELECT r2 FROM Round r2 WHERE r2.tournament = t " +
            "AND r2.status != com.project.backend.models.constants.RoundStatus.EVALUATED)")
    int finishTournaments();
}
