package com.project.backend.controllers;

import com.project.backend.dto.submission.SubmissionFullResponse;
import com.project.backend.dto.submission.SubmissionListResponse;
import com.project.backend.dto.submission.SubmissionRequest;
import com.project.backend.dto.user.UserResponse;
import com.project.backend.dto.wrapper.PaginationListResponse;
import com.project.backend.mappers.SubmissionMapper;
import com.project.backend.mappers.UserMapper;
import com.project.backend.models.Submission;
import com.project.backend.models.User;
import com.project.backend.services.interfaces.SubmissionService;
import com.project.backend.services.interfaces.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/submissions")
@Tag(name = "Submissions", description = "API for managing competition submissions")
public class SubmissionController {
    private final SubmissionService submissionService;
    private final UserService userService;
    private final SubmissionMapper submissionMapper;
    private final UserMapper userMapper;

    @GetMapping("/check/{round_id}")
    @Operation(summary = "Check submission", description = "Checks if user's team has already sent a submission to the specified round")
    public Long check(
            @Parameter(description = "ID of the round where the submission may be sent", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Submission submission = submissionService.check(
                roundId,
                me.getId()
        );
        return submission == null ? -1 : submission.getId();
    }

    @PostMapping("/send/{round_id}")
    @Operation(summary = "Send submission", description = "Creates and sends a submission to the specified round")
    public SubmissionFullResponse send(
            @Parameter(description = "ID of the round where the submission will be sent", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(description = "Submission data")
            @RequestBody SubmissionRequest submissionRequest,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Submission submission = submissionService.create(
                roundId,
                me,
                submissionMapper.fromRequestToSubmission(submissionRequest)
        );

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @PutMapping("/{submission_id}")
    @Operation(summary = "Update submission", description = "Updates an existing submission")
    public SubmissionFullResponse update(
            @Parameter(description = "ID of the submission to update", example = "10")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(description = "Updated submission data")
            @RequestBody SubmissionRequest submissionRequest,

            @Parameter(hidden = true)
            Authentication authentication) {
        Submission submission = submissionService.update(
                submissionId,
                submissionMapper.fromRequestToSubmission(submissionRequest)
        );

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @DeleteMapping("/{submission_id}")
    @Operation(summary = "Delete submission", description = "Deletes a submission by its ID")
    public void delete(
            @Parameter(description = "ID of the submission to delete", example = "10")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(hidden = true)
            Authentication authentication) {
        submissionService.delete(submissionId);
    }

    @GetMapping("/{submission_id}")
    @Operation(summary = "Get submission by ID", description = "Returns full information about a submission")
    public SubmissionFullResponse getById(

            @Parameter(description = "ID of the submission", example = "10")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Submission submission = submissionService.findById(submissionId);

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @GetMapping("/my")
    @Operation(summary = "Get submissions for jury", description = "Returns paginated list of submissions assigned to the authenticated jury member")
    public PaginationListResponse<SubmissionListResponse> getAllForJury(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(hidden = true)
            Authentication authentication) {
        User me = userService.findUserByAuth(authentication);
        Page<Submission> submissionPage = submissionService.findAllForJury(me, page, size);

        PaginationListResponse<SubmissionListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(submissionPage.getTotalPages());
        response.setContent(
                submissionPage.getContent()
                        .stream()
                        .map(submissionMapper::fromSubmissionToListResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/rounds/{round_id}")
    @Operation(summary = "Get submissions by round", description = "Returns paginated list of submissions for a specific round")
    public PaginationListResponse<SubmissionListResponse> getAllByRound(
            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "ID of the round", example = "1")
            @PathVariable(value = "round_id") Long roundId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Page<Submission> submissionPage = submissionService.findAllByRound(roundId, page, size);

        PaginationListResponse<SubmissionListResponse> response = new PaginationListResponse<>();

        response.setTotalPages(submissionPage.getTotalPages());
        response.setContent(
                submissionPage.getContent()
                        .stream()
                        .map(submissionMapper::fromSubmissionToListResponse)
                        .toList()
        );

        return response;
    }

    @PostMapping("/{submission_id}/juries/{jury_id}")
    @Operation(summary = "Assign jury to submission", description = "Assigns a jury member to evaluate a submission")
    public SubmissionFullResponse setJury(
            @Parameter(description = "ID of the submission", example = "10")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(description = "ID of the jury user", example = "3")
            @PathVariable(value = "jury_id") Long juryId) {
        Submission submission = submissionService.setJury(submissionId, juryId);

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @DeleteMapping("/{submission_id}/juries/{jury_id}")
    @Operation(summary = "Remove jury from submission", description = "Removes a jury member from a submission")
    public SubmissionFullResponse removeJury(
            @Parameter(description = "ID of the submission", example = "10")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(description = "ID of the jury user", example = "3")
            @PathVariable(value = "jury_id") Long juryId) {
        Submission submission = submissionService.removeJury(submissionId, juryId);

        return submissionMapper.fromSubmissionToFullResponse(submission);
    }

    @GetMapping("/{submission_id}/juries")
    @Operation(summary = "Get all juries by submission", description = "Returns paginated list of users with JURY role by submission")
    public PaginationListResponse<UserResponse> getAllJuriesBySubmission(
            @Parameter(description = "Search query for jury users", example = "john")
            @RequestParam(value = "query", required = false) String query,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Submission id", example = "1")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Page<User> userPage = userService.findAllJuriesUsersForSubmission(page, size, query, submissionId);

        PaginationListResponse<UserResponse> response = new PaginationListResponse<>();

        response.setTotalPages(userPage.getTotalPages());
        response.setContent(
                userPage.getContent()
                        .stream()
                        .map(userMapper::fromUserToResponse)
                        .toList()
        );

        return response;
    }

    @GetMapping("/{submission_id}/available-juries")
    @Operation(summary = "Get all juries by submission", description = "Returns paginated list of users with JURY role by submission")
    public PaginationListResponse<UserResponse> getAllAvailableJuriesBySubmission(
            @Parameter(description = "Search query for jury users", example = "john")
            @RequestParam(value = "query", required = false) String query,

            @Parameter(description = "Page number (starting from 0)", example = "0")
            @RequestParam(value = "page") Integer page,

            @Parameter(description = "Page size", example = "10")
            @RequestParam(value = "size") Integer size,

            @Parameter(description = "Submission id", example = "1")
            @PathVariable(value = "submission_id") Long submissionId,

            @Parameter(hidden = true)
            Authentication authentication) {
        Page<User> userPage = userService.findAllAvailableJuriesUsersForSubmission(page, size, query, submissionId);

        PaginationListResponse<UserResponse> response = new PaginationListResponse<>();

        response.setTotalPages(userPage.getTotalPages());
        response.setContent(
                userPage.getContent()
                        .stream()
                        .map(userMapper::fromUserToResponse)
                        .toList()
        );

        return response;
    }
}
