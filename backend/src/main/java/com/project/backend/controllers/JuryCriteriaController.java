package com.project.backend.controllers;

import com.project.backend.dto.juryCriteria.JuryCriteriaResponse;
import com.project.backend.dto.wrapper.LongDTO;
import com.project.backend.mappers.JurySubmissionCriteriaMapper;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.services.interfaces.JurySubmissionCriteriaService;
import com.project.backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/jury-criteria")
public class JuryCriteriaController {
    private final JurySubmissionCriteriaService jurySubmissionCriteriaService;
    private final UserService userService;
    private final JurySubmissionCriteriaMapper jurySubmissionCriteriaMapper;

    @PostMapping("/submission/{submission_id}/criteria/{criteria_id}")
    public JuryCriteriaResponse set(@PathVariable(value = "submission_id") Long submissionId, @PathVariable(value = "criteria_id") Long criteriaId, @RequestBody LongDTO longDTO) {
        JurySubmissionCriteria jurySubmissionCriteria = jurySubmissionCriteriaService.create(submissionId, criteriaId, longDTO.getValue());

        return jurySubmissionCriteriaMapper.fromJurySubmissionCriteriaToResponse(jurySubmissionCriteria);
    }

    @PutMapping("/submission/{submission_id}/criteria/{criteria_id}")
    public JuryCriteriaResponse update(@PathVariable(value = "submission_id") Long submissionId, @PathVariable(value = "criteria_id") Long criteriaId, @RequestBody LongDTO longDTO) {
        JurySubmissionCriteria jurySubmissionCriteria = jurySubmissionCriteriaService.update(submissionId, criteriaId, longDTO.getValue());

        return jurySubmissionCriteriaMapper.fromJurySubmissionCriteriaToResponse(jurySubmissionCriteria);
    }

    @GetMapping("/submission/{submission_id}")
    public List<JuryCriteriaResponse> getAllMy(@PathVariable(value = "submission_id") Long submissionId, Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        List<JurySubmissionCriteria> jurySubmissionCriteriaList = jurySubmissionCriteriaService.findAllBySubmissionForJury(submissionId, me);

        return jurySubmissionCriteriaList.stream().map(jurySubmissionCriteriaMapper::fromJurySubmissionCriteriaToResponse).toList();
    }
}
