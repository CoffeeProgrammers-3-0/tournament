package com.project.backend.controllers;

import com.project.backend.dto.juryCriteria.JuryCriteriaResponse;
import com.project.backend.dto.wrapper.LongDTO;
import com.project.backend.mappers.JurySubmissionCriteriaMapper;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.services.interfaces.JurySubmissionCriteriaService;
import com.project.backend.services.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/jury-criteria")
@Tag(name = "Jury Criteria", description = "API for jury scoring submissions by criteria")
public class JuryCriteriaController {
    private final JurySubmissionCriteriaService jurySubmissionCriteriaService;
    private final UserService userService;
    private final JurySubmissionCriteriaMapper jurySubmissionCriteriaMapper;

    @PutMapping("/submission/{submission_id}/criteria/{criteria_id}")
    @Operation(summary = "Update criteria score", description = "Updates a previously given score for a submission criteria")
    public JuryCriteriaResponse set(
            @Parameter(description = "ID of the submission being evaluated", example = "1")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(description = "ID of the criteria being scored", example = "5")
            @PathVariable(value = "criteria_id") Long criteriaId,

            @Parameter(description = "Updated score value")
            @RequestBody LongDTO longDTO,

            @Parameter(hidden = true)
            Authentication authentication) {
        User jury = userService.findUserByAuth(authentication);
        JurySubmissionCriteria jurySubmissionCriteria = jurySubmissionCriteriaService.set(submissionId, criteriaId, longDTO.getValue(), jury);

        return jurySubmissionCriteriaMapper.fromJurySubmissionCriteriaToResponse(jurySubmissionCriteria);
    }

    @GetMapping("/submission/{submission_id}")
    @Operation(summary = "Get my criteria scores", description = "Returns all criteria scores for the specified submission given by the authenticated jury member")
    public List<JuryCriteriaResponse> getAllMy(
            @Parameter(description = "ID of the submission", example = "1")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        List<JurySubmissionCriteria> jurySubmissionCriteriaList = jurySubmissionCriteriaService.findAllBySubmissionForJury(submissionId, me);

        return jurySubmissionCriteriaList.stream().map(jurySubmissionCriteriaMapper::fromJurySubmissionCriteriaToResponse).toList();
    }
}
