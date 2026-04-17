package com.project.backend.auth.utils;

import com.project.backend.models.*;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.TeamSpecification;
import com.project.backend.repositories.specifications.UserSpecification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.context.annotation.RequestScope;

import java.util.Objects;

@Slf4j
@Component("currentUserContainer")
@RequestScope(proxyMode = ScopedProxyMode.TARGET_CLASS)
@RequiredArgsConstructor
public class CurrentUserContainer {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TournamentRepository tournamentRepository;
    private final SubmissionRepository submissionRepository;
    private final TeamTaskRepository teamTaskRepository;

    private User user;
    private Team teamById;
    private Team teamByRound;
    private Team teamByTournament;
    private Team teamBySubmission;
    private Round round;
    private Tournament tournament;
    private Submission submission;
    private TeamTask teamTask;

    private Long savedTeamId;
    private Long savedTeamRoundId;
    private Long savedTeamTournamentId;
    private Long savedTeamSubmissionId;
    private Long savedRoundId;
    private Long savedTournamentId;
    private Long savedSubmissionId;
    private Long savedTeamTaskId;

    public User getUser() {
        return getUser(SecurityContextHolder.getContext().getAuthentication());
    }

    public User getUser(Authentication auth) {
        if (user == null) {
            if (auth != null && auth.isAuthenticated() && !(auth instanceof AnonymousAuthenticationToken)) {
                log.debug("CurrentUserContainer: Loading user from database for email: {}", auth.getName());
                this.user = userRepository.findOne(UserSpecification.byKeycloakUserId(auth.getName())).orElse(null);
            }
        } else {
            log.debug("CurrentUserContainer: Returning cached user. ID: {}", user.getId());
        }
        if (user == null) log.debug("CurrentUserContainer: Returning null user.");
        return user;
    }

    public Team getTeamById(Long teamId) {
        if (teamById == null || !Objects.equals(savedTeamId, teamId)) {
            log.debug("CurrentUserContainer: Loading team from database. ID: {}", teamId);
            this.teamById = teamRepository.findById(teamId).orElse(null);
            savedTeamId = teamId;
        } else {
            log.debug("CurrentUserContainer: Returning cached team. ID: {}", teamId);
        }
        return teamById;
    }

    public Team getTeamByRoundId(Long roundId) {
        if (teamByRound == null || !Objects.equals(savedTeamRoundId, roundId)) {
            User me = getUser();
            if (me != null) {
                log.debug("CurrentUserContainer: Fetching team from database for user ID {} and round ID {}", me.getId(), roundId);
                this.teamByRound = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(me.getId()),TeamSpecification.byRoundId(roundId))).orElse(null);
            }
            savedTeamRoundId = roundId;
        } else {
            log.debug("CurrentUserContainer: Returning cached team for round ID {}", roundId);
        }
        return teamByRound;
    }

    public Team getTeamByTournamentId(Long tournamentId) {
        if (teamByTournament == null || !Objects.equals(savedTeamTournamentId, tournamentId)) {
            User me = getUser();
            if (me != null) {
                log.debug("CurrentUserContainer: Fetching team from database for user ID {} and tournament ID {}", me.getId(), tournamentId);
                this.teamByTournament = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(me.getId()), TeamSpecification.byTournamentId(tournamentId))).orElse(null);
            }
            savedTeamTournamentId = tournamentId;
        } else {
            log.debug("CurrentUserContainer: Returning cached team for tournament ID {}", tournamentId);
        }
        return teamByTournament;
    }

    public Team getTeamBySubmissionId(Long submissionId) {
        if (teamBySubmission == null || !Objects.equals(savedTeamSubmissionId, submissionId)) {
            User me = getUser();
            if (me != null) {
                log.debug("CurrentUserContainer: Fetching team from database for user ID {} and submission ID {}", me.getId(), submissionId);
                this.teamBySubmission = teamRepository.findOne(Specification.allOf(TeamSpecification.byUserId(me.getId()), TeamSpecification.bySubmissionId(submissionId))).orElse(null);
            }
            savedTeamSubmissionId = submissionId;
        } else {
            log.debug("CurrentUserContainer: Returning cached team for submission ID {}", submissionId);
        }
        return teamBySubmission;
    }

    public Round getRound(Long roundId) {
        if (round == null || !Objects.equals(savedRoundId, roundId)) {
            log.debug("CurrentUserContainer: Loading round from database. ID: {}", roundId);
            this.round = roundRepository.findById(roundId).orElse(null);
            savedRoundId = roundId;
        } else {
            log.debug("CurrentUserContainer: Returning cached round. ID: {}", roundId);
        }
        return round;
    }

    public Tournament getTournament(Long tournamentId) {
        if (tournament == null || !Objects.equals(savedTournamentId, tournamentId)) {
            log.debug("CurrentUserContainer: Loading tournament from database. ID: {}", tournamentId);
            this.tournament = tournamentRepository.findById(tournamentId).orElse(null);
            savedTournamentId = tournamentId;
        } else {
            log.debug("CurrentUserContainer: Returning cached tournament. ID: {}", tournamentId);
        }
        return tournament;
    }

    public Submission getSubmission(Long submissionId) {
        if (submission == null || !Objects.equals(savedSubmissionId, submissionId)) {
            log.debug("CurrentUserContainer: Loading submission from database. ID: {}", submissionId);
            this.submission = submissionRepository.findById(submissionId).orElse(null);
            savedSubmissionId = submissionId;
        } else {
            log.debug("CurrentUserContainer: Returning cached submission. ID: {}", submissionId);
        }
        return submission;
    }

    public TeamTask getTeamTask(Long teamTaskId) {
        if (teamTask == null || !Objects.equals(savedTeamTaskId, teamTaskId)) {
            log.debug("CurrentUserContainer: Loading team task from database. ID: {}", teamTaskId);
            this.teamTask = teamTaskRepository.findById(teamTaskId).orElse(null);
            savedTeamTaskId = teamTaskId;
        } else {
            log.debug("CurrentUserContainer: Returning cached team task. ID: {}", teamTaskId);
        }
        return teamTask;
    }
}