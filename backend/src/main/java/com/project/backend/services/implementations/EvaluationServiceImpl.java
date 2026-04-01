package com.project.backend.services.implementations;

import com.project.backend.models.Submission;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.Jury;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.repositories.JuryRepository;
import com.project.backend.repositories.JurySubmissionRepository;
import com.project.backend.repositories.SubmissionRepository;
import com.project.backend.repositories.specifications.JurySpecification;
import com.project.backend.repositories.specifications.JurySubmissionSpecification;
import com.project.backend.repositories.specifications.SubmissionSpecification;
import com.project.backend.services.interfaces.EvaluationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EvaluationServiceImpl implements EvaluationService {
    private final SubmissionRepository submissionRepository;
    private final JurySubmissionRepository jurySubmissionRepository;
    private final JuryRepository juryRepository;

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
        for (Submission s : submissions) {
            for (int i = 0; i < k; i++) {
                pool.add(s);
            }
        }

        Collections.shuffle(pool);
        Collections.shuffle(juries);

        List<JurySubmission> assignmentsToSave = new ArrayList<>();
        HashSet<String> assignedPairs = new HashSet<>();
        int juryIndex = 0;

        for (Submission sub : pool) {
            int attempts = 0;
            while (true) {
                User jury = juries.get(juryIndex % juries.size());
                String pairKey = sub.getId() + "-" + jury.getId();

                if (!assignedPairs.contains(pairKey)) {
                    JurySubmission assignment = new JurySubmission();
                    assignment.setJury(jury);
                    assignment.setSubmission(sub);

                    assignmentsToSave.add(assignment);
                    assignedPairs.add(pairKey);

                    juryIndex++;
                    break;
                }

                juryIndex++;
                attempts++;

                if (attempts >= juries.size()) {
                    log.error("Can not auto assign juries for submission with id {} - all juries is busy", sub.getId());
                    throw new IllegalStateException("Deadlock while assigning: not enough juries for K=" + k);
                }
            }
        }

        jurySubmissionRepository.saveAll(assignmentsToSave);
    }
}
