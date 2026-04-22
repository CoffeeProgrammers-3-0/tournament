package com.project.backend.controllers;

import com.project.backend.auth.utils.CurrentUserContainer;
import com.project.backend.dto.juryCriteria.JuryCriteriaRequest;
import com.project.backend.dto.juryCriteria.JuryCriteriaResponse;
import com.project.backend.mappers.JurySubmissionCriteriaMapper;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.services.interfaces.JurySubmissionCriteriaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/jury-criteria")
@Tag(name = "Jury Criteria", description = "API for jury scoring submissions by criteria")
public class JuryCriteriaController {
    private final JurySubmissionCriteriaService jurySubmissionCriteriaService;
    private final JurySubmissionCriteriaMapper jurySubmissionCriteriaMapper;
    private final CurrentUserContainer currentUserContainer;

    @PreAuthorize("hasRole('JURY') and @userSecurity.isJuryOfSubmission(#submissionId)")
    @PutMapping("/submission/{submission_id}/criteria/{criteria_id}")
    @Operation(summary = "Update criteria score", description = "Updates a previously given score for a submission criteria")
    public JuryCriteriaResponse set(
            @Parameter(description = "ID of the submission being evaluated", example = "1")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(description = "ID of the criteria being scored", example = "5")
            @PathVariable(value = "criteria_id") Long criteriaId,

            @Parameter(description = "Updated score value")
            @RequestBody @Valid JuryCriteriaRequest juryCriteriaRequest) {
        User jury = currentUserContainer.getUser();
        JurySubmissionCriteria jurySubmissionCriteria = jurySubmissionCriteriaService.set(submissionId, criteriaId, juryCriteriaRequest.getPoints(), juryCriteriaRequest.isAdditional(), juryCriteriaRequest.getComment(), jury);

        return jurySubmissionCriteriaMapper.fromJurySubmissionCriteriaToResponse(jurySubmissionCriteria);
    }

    @PreAuthorize("hasRole('JURY') and @userSecurity.isJuryOfSubmission(#submissionId)")
    @GetMapping("/submission/{submission_id}")
    @Operation(summary = "Get my criteria scores", description = "Returns all criteria scores for the specified submission given by the authenticated jury member")
    public List<JuryCriteriaResponse> getAllMy(
            @Parameter(description = "ID of the submission", example = "1")
            @PathVariable(value = "submission_id") Long submissionId) {
        User me = currentUserContainer.getUser();
        List<JurySubmissionCriteria> jurySubmissionCriteriaList = jurySubmissionCriteriaService.findAllBySubmissionForJury(submissionId, me);

        return jurySubmissionCriteriaList.stream().map(jurySubmissionCriteriaMapper::fromJurySubmissionCriteriaToResponse).toList();
    }
}
