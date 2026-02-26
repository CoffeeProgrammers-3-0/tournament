package com.project.backend.controllers;

import com.project.backend.dto.submission.SubmissionFullResponse;
import com.project.backend.dto.submission.SubmissionListResponse;
import com.project.backend.dto.submission.SubmissionRequest;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.SubmissionMapper;
import com.project.backend.models.Submission;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.SubmissionService;
import com.project.backend.services.interfaces.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    private final UserService userService;
    private final SubmissionMapper submissionMapper;

    @PostMapping("/send/{round_id}")
    public SubmissionFullResponse send(@PathVariable(value = "round_id") Long roundId, @RequestBody SubmissionRequest submissionRequest, Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Submission submission = submissionService.create(roundId, me, submissionMapper.fromRequestToSubmission(submissionRequest));

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @PutMapping("/{submission_id}")
    public SubmissionFullResponse update(@PathVariable(value = "submission_id") Long submissionId, @RequestBody SubmissionRequest submissionRequest, Authentication authentication) {
        Submission submission = submissionService.update(submissionId, submissionMapper.fromRequestToSubmission(submissionRequest));

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @DeleteMapping("/{submission_id}")
    public void delete(@PathVariable(value = "submission_id") Long submissionId, Authentication authentication) {
        submissionService.delete(submissionId);
    }

    @GetMapping("/{submission_id}")
    public SubmissionFullResponse getById(@PathVariable(value = "submission_id") Long submissionId, Authentication authentication) {
        Submission submission = submissionService.findById(submissionId);

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @GetMapping("/my")
    public PaginationListResponse<SubmissionListResponse> getAllForJury(Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Page<Submission> submissionPage = submissionService.findAllForJury(me);

        PaginationListResponse<SubmissionListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(submissionPage.getTotalPages());
        response.setContent(submissionPage.getContent().stream().map(submissionMapper::fromSubmissionToListResponse).toList());

        return response;
    }

    @GetMapping("/rounds/{round_id}")
    public PaginationListResponse<SubmissionListResponse> getAllByRound(@PathVariable(value = "round_id") Long roundId, Authentication authentication) {
        Page<Submission> submissionPage = submissionService.findAllByRound(roundId);

        PaginationListResponse<SubmissionListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(submissionPage.getTotalPages());
        response.setContent(submissionPage.getContent().stream().map(submissionMapper::fromSubmissionToListResponse).toList());

        return response;
    }

    @PatchMapping("/{submission_id}/set-jury/{jury_id}")
    public SubmissionFullResponse setJury(@PathVariable(value = "submission_id") Long submissionId, @PathVariable(value = "jury_id") Long juryId) {
        Submission submission = submissionService.setJury(submissionId, juryId);

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }
}
