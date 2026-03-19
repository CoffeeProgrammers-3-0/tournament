package com.project.backend.services.implementations;

import com.project.backend.models.Round;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.constants.Role;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.ids.JuryId;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.JurySpecification;
import com.project.backend.repositories.specifications.JurySubmissionSpecification;
import com.project.backend.repositories.specifications.RoundSpecification;
import com.project.backend.repositories.specifications.TournamentSpecification;
import com.project.backend.services.interfaces.RoundService;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoundServiceImpl implements RoundService {
    private final RoundRepository roundRepository;
    private final TournamentRepository tournamentRepository;
    private final UserRepository userRepository;
    private final JuryRepository juryRepository;
    private final JurySubmissionRepository jurySubmissionRepository;

    @Override
    public Round create(Long tournamentId, Round round) {
        Tournament tournament = tournamentRepository.findOne(TournamentSpecification.byId(tournamentId)).orElseThrow(() -> new EntityNotFoundException("Tournament not found"));
        long actualCountOfRounds = roundRepository.count(RoundSpecification.byTournamentId(tournamentId));
        if(actualCountOfRounds >= tournament.getCountOfRounds()) {
            throw new IllegalStateException("Tournament already has max count of rounds, change this value in tournament settings");
        }
        round.setTournament(tournament);
        round.setStatus(RoundStatus.DRAFT);
        return roundRepository.save(round);
    }

    @Override
    public Round update(Long roundId, Round round) {
        Round roundToUpdate = findById(roundId);

        roundToUpdate.setName(round.getName());
        roundToUpdate.setRequirements(round.getRequirements());
        roundToUpdate.setStatus(round.getStatus());
        roundToUpdate.setEndDate(round.getEndDate());
        roundToUpdate.setStartDate(round.getStartDate());
        roundToUpdate.setTask(round.getTask());
        roundToUpdate.setCountOfWinners(round.getCountOfWinners());

        return roundRepository.save(roundToUpdate);
    }

    @Override
    public void delete(Long roundId) {
        Round round = findById(roundId);
        roundRepository.delete(round);
    }

    @Override
    public Page<Round> findAllByTournament(Long tournamentId, Integer page, Integer size, String search, RoundStatus status) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "startDate"));
        return roundRepository.findAll(Specification.allOf(RoundSpecification.byTournamentId(tournamentId), RoundSpecification.byStatus(status)), pageRequest);
    }

    @Override
    public Round findById(Long roundId) {
        return roundRepository.findById(roundId).orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));
    }

    @Override
    public void setJury(Long roundId, Long juryId) {
        if(juryRepository.exists(JurySpecification.byUserIdAndRoundId(juryId, roundId))) {
            throw new IllegalStateException("Jury with id " + juryId + " is already assigned to round with id " + roundId);
        }

        Round round = findById(roundId);
        User juryUser = userRepository.findById(juryId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        if(juryUser.getRole() != Role.JURY) {
            throw new IllegalStateException("User must have jury role to be jury");
        }

        JuryId juryEmbeddedId = new JuryId();
        juryEmbeddedId.setRoundId(roundId);
        juryEmbeddedId.setUserId(juryId);

        Jury jury = new Jury();
        jury.setId(juryEmbeddedId);
        jury.setRound(round);
        jury.setUser(juryUser);

        juryRepository.save(jury);
    }

    @Override
    @Transactional
    public void removeJury(Long roundId, Long juryId) {
        if(!juryRepository.exists(JurySpecification.byUserIdAndRoundId(juryId, roundId))) {
            throw new IllegalStateException("Jury with id " + juryId + " is not assigned to round with id " + roundId);
        }

        juryRepository.delete(JurySpecification.byUserIdAndRoundId(juryId, roundId));
        jurySubmissionRepository.delete(JurySubmissionSpecification.byJuryId(juryId));
    }
}
