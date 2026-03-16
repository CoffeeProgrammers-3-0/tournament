package com.project.backend.mappers;

import com.project.backend.dto.submission.SubmissionFullResponse;
import com.project.backend.dto.submission.SubmissionListResponse;
import com.project.backend.dto.submission.SubmissionRequest;
import com.project.backend.models.Submission;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring", uses = {TeamMapper.class, RoundMapper.class})
public interface SubmissionMapper {
    Submission fromRequestToSubmission(SubmissionRequest submissionRequest);

    SubmissionListResponse fromSubmissionToListResponse(Submission submission);
    SubmissionFullResponse fromSubmissionToFullResponse(Submission submission);
}
