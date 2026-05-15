package com.project.backend.auth.config;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.models.Certificate;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.AdminMessageSpecification;
import com.project.backend.repositories.specifications.RoundEventSpecification;
import com.project.backend.repositories.specifications.UserSpecification;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.Objects;

@Slf4j
@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {
    private final CertificateRepository certificateRepository;
    private final CurrentUserContainer currentUserContainer;
    private final TeamParticipantRepository teamParticipantRepository;
    private final JurySubmissionRepository jurySubmissionRepository;
    private final AdminMessageRepository adminMessageRepository;
    private final UserRepository userRepository;
    private final RoundEventRepository roundEventRepository;

    public boolean isMemberOfTheTeamInRound(Long roundId) {
        return currentUserContainer.getTeamByRoundId(roundId) != null;
    }

    public boolean isMemberOfTheTeamInSubmission(Long submissionId) {
        return currentUserContainer.getTeamBySubmissionId(submissionId) != null;
    }

    public boolean isLeaderOfTeam(Long teamId) {
        User me = currentUserContainer.getUser();
        if (me == null) return false;
        return teamParticipantRepository.isUserLeaderOfTeam(teamId, me.getId());
    }

    public boolean isLeaderOfTeamInTournament(Long teamId, Long tournamentId) {
        User me = currentUserContainer.getUser();
        if (me == null) return false;

       return teamParticipantRepository.isUserLeaderOfTeamInTournament(teamId, me.getId(), tournamentId);
    }

    public boolean isMemberOfTheTeamOfTheTeamTask(Long teamTaskId) {
        User me = currentUserContainer.getUser();
        if (me == null) return false;
        return teamParticipantRepository.isMemberOfTeamByTaskId(teamTaskId, me.getId());
    }

    public boolean checkUser(Long userId) {
        User me = currentUserContainer.getUser();
        return me != null && Objects.equals(me.getId(), userId);
    }

    public boolean checkUser(Long userId, Authentication auth) {
        User me = userRepository.findOne(UserSpecification.byKeycloakUserId(auth.getName())).orElse(null);
        return me != null && Objects.equals(me.getId(), userId);
    }

    public boolean isJuryOfSubmission(Long submissionId) {
        User me = currentUserContainer.getUser();
        if (me == null || !me.getRole().equals(Role.JURY)) return false;
        return jurySubmissionRepository.isJuryAssignedToSubmission(submissionId, me.getId());
    }

    public boolean isCreatorOfAdminMessage(Long adminMessageId) {
        User me = currentUserContainer.getUser();
        if (me == null || !me.getRole().equals(Role.ADMIN)) return false;
        return adminMessageRepository.exists(Specification.allOf(
                AdminMessageSpecification.byCreatorId(me.getId()),
                AdminMessageSpecification.byId(adminMessageId)
        ));
    }

    public boolean isCreatorOfRoundEvent(Long roundEventId) {
        User me = currentUserContainer.getUser();
        if (me == null || !me.getRole().equals(Role.ADMIN)) return false;
        return roundEventRepository.exists(Specification.allOf(
                RoundEventSpecification.byId(roundEventId),
                RoundEventSpecification.byCreatorId(me.getId())
        ));
    }

    public boolean hasAccessToCertificate(Long certificateId) {
        User me = currentUserContainer.getUser();
        Certificate certificate = certificateRepository.findById(certificateId).orElseThrow(() -> new EntityNotFoundException("Certificate not found"));
        if (me == null) return false;
        if(certificate.getCreator() != null && certificate.getCreator().getId().equals(me.getId())) {
            return true;
        } else if(certificate.getReceiver() != null && certificate.getReceiver().getId().equals(me.getId())) {
            return true;
        }
        return false;
    }
}