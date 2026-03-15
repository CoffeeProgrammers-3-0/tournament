package com.project.backend.services.implementations;

import com.project.backend.models.Criteria;
import com.project.backend.models.Round;
import com.project.backend.models.Submission;
import com.project.backend.models.User;
import com.project.backend.models.ids.JurySubmissionCriteriaId;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.repositories.CriteriaRepository;
import com.project.backend.repositories.JuryRepository;
import com.project.backend.repositories.JurySubmissionRepository;
import com.project.backend.repositories.SubmissionRepository;
import com.project.backend.repositories.specifications.CriteriaSpecification;
import com.project.backend.repositories.specifications.JurySpecification;
import com.project.backend.repositories.specifications.JurySubmissionSpecification;
import com.project.backend.repositories.specifications.SubmissionSpecification;
import com.project.backend.services.interfaces.EvaluationService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class EvaluationServiceImpl implements EvaluationService {
    private final SubmissionRepository submissionRepository;
    private final JurySubmissionRepository jurySubmissionRepository;
    private final JuryRepository juryRepository;
    private final CriteriaRepository criteriaRepository;

    @Transactional
    @Override
    public void assignSubmissionsToJury(Long roundId, int k) {
        jurySubmissionRepository.delete(JurySubmissionSpecification.byRoundId(roundId));

        List<Submission> submissions = submissionRepository.findAll(SubmissionSpecification.byRoundId(roundId));
        List<User> juries = new ArrayList<>(juryRepository.findAll(JurySpecification.byRoundId(roundId))
                .stream().map(Jury::getUser).toList());

        if(juries.isEmpty()) throw new IllegalStateException("There is no jury for round with id " + roundId);
        if(k > juries.size()) throw new IllegalStateException("There is not enough juries to judge every submission " + k + " times! maximum amount is " + juries.size() + " times");
        
        List<Submission> pool = new ArrayList<>();
        for(Submission s : submissions) {
            for (int i = 0; i < k; i++) {
                pool.add(s);
            }
        }

        Collections.shuffle(pool);
        Collections.shuffle(juries);

        int juryIndex = 0;
        for (Submission sub : pool) {

            int skippedInARow = 0;

            while (true) {
                User currentJury = juries.get(juryIndex % juries.size());

                if (!isAlreadyAssigned(currentJury, sub)) {
                    saveAssignment(currentJury, sub);
                    juryIndex++;
                    break;
                }

                juryIndex++;
                skippedInARow++;

                if (skippedInARow >= juries.size()) {
                    log.error("Can not auto assign juries for submission with id {} - all juries is busy", sub.getId());
                    throw new IllegalStateException("Deadlock while assigning: not enough juries for K=" + k);
                }
            }
        }
    }

    private boolean isAlreadyAssigned(User currentJury, Submission sub) {
        return jurySubmissionRepository.exists(JurySubmissionSpecification.bySubmissionIdAndJuryId(sub.getId(), currentJury.getId()));
    }

    private void saveAssignment(User judge, Submission sub) {
        JurySubmission assignment = new JurySubmission();
        assignment.setJury(judge);
        assignment.setSubmission(sub);
        fillWithZeroPoints(assignment);
        jurySubmissionRepository.save(assignment);
    }

    @Override
    public void fillWithZeroPoints(JurySubmission assignment) {
        Round round = assignment.getSubmission().getRound();

        List<Criteria> criteriaList = criteriaRepository.findAll(CriteriaSpecification.byRoundId(round.getId()));

        for (Criteria criteria : criteriaList) {
            JurySubmissionCriteria jsc = new JurySubmissionCriteria();

            JurySubmissionCriteriaId id = new JurySubmissionCriteriaId();
            id.setJurySubmissionId(assignment.getId());
            id.setCriteriaId(criteria.getId());

            jsc.setId(id);
            jsc.setJurySubmission(assignment);
            jsc.setCriteria(criteria);
            jsc.setPoints(0L);

            assignment.getCriteriaPoints().add(jsc);
        }
    }
}
