package com.project.backend.services.implementations;

import com.project.backend.models.Round;
import com.project.backend.models.Submission;
import com.project.backend.models.Team;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.repositories.*;
import com.project.backend.services.interfaces.EvaluationService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SubmissionServiceImplTest {

    @Mock
    private SubmissionRepository submissionRepository;

    @Mock
    private RoundRepository roundRepository;

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private JurySubmissionRepository jurySubmissionRepository;

    @Mock
    private EvaluationService evaluationService;

    @InjectMocks
    private SubmissionServiceImpl service;

    @Test
    void create_shouldSaveSubmission() {

        Long roundId = 1L;

        User creator = new User();
        creator.setId(5L);

        Round round = new Round();
        Team team = new Team();

        Submission submission = new Submission();

        when(roundRepository.getReferenceById(roundId)).thenReturn(round);

        when(teamRepository.findOne(
                argThat((Specification<Team> spec) -> spec != null)
        )).thenReturn(Optional.of(team));

        when(submissionRepository.save(submission)).thenReturn(submission);

        Submission result = service.create(roundId, creator, submission);

        assertEquals(round, result.getRound());
        assertEquals(team, result.getTeam());

        verify(roundRepository).getReferenceById(roundId);

        verify(teamRepository).findOne(
                argThat((Specification<Team> spec) -> spec != null)
        );

        verify(submissionRepository).save(submission);

        verifyNoMoreInteractions(roundRepository, teamRepository, submissionRepository);
    }

    @Test
    void create_shouldThrowException_whenTeamNotFound() {

        User creator = new User();
        creator.setId(1L);

        when(teamRepository.findOne(
                argThat((Specification<Team> spec) -> spec != null)
        )).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.create(1L, creator, new Submission()));

        verify(teamRepository).findOne(
                argThat((Specification<Team> spec) -> spec != null)
        );

        verifyNoInteractions(submissionRepository);
    }

    @Test
    void update_shouldUpdateFields() {

        Long submissionId = 1L;

        Submission existing = new Submission();
        existing.setId(submissionId);

        Submission updated = new Submission();
        updated.setDescription("desc");
        updated.setVideoLink("video");
        updated.setGithubLink("git");

        when(submissionRepository.findById(submissionId))
                .thenReturn(Optional.of(existing));

        when(submissionRepository.save(existing))
                .thenReturn(existing);

        Submission result = service.update(submissionId, updated);

        assertEquals("desc", result.getDescription());
        assertEquals("video", result.getVideoLink());
        assertEquals("git", result.getGithubLink());

        verify(submissionRepository).findById(submissionId);
        verify(submissionRepository).save(existing);

        verifyNoMoreInteractions(submissionRepository);
    }

    @Test
    void delete_shouldDeleteSubmission() {

        Long submissionId = 1L;

        Submission submission = new Submission();
        submission.setId(submissionId);

        when(submissionRepository.findById(submissionId))
                .thenReturn(Optional.of(submission));

        service.delete(submissionId);

        verify(submissionRepository).findById(submissionId);
        verify(submissionRepository).delete(submission);

        verifyNoMoreInteractions(submissionRepository);
    }

    @Test
    void findAllForJury_shouldReturnPage() {

        User jury = new User();
        jury.setId(3L);

        PageRequest pageRequest = PageRequest.of(
                0, 10, Sort.by(Sort.Direction.ASC, "id")
        );

        Page<Submission> page = new PageImpl<>(List.of(new Submission()));

        when(submissionRepository.findAll(
                argThat((Specification<Submission> spec) -> spec != null),
                eq(pageRequest)
        )).thenReturn(page);

        Page<Submission> result = service.findAllForJury(jury, 0, 10);

        assertEquals(page, result);

        verify(submissionRepository).findAll(
                argThat((Specification<Submission> spec) -> spec != null),
                eq(pageRequest)
        );

        verifyNoMoreInteractions(submissionRepository);
    }

    @Test
    void setJury_shouldSaveJurySubmission() {

        Long submissionId = 1L;
        Long juryId = 2L;

        User jury = new User();
        Submission submission = new Submission();

        when(jurySubmissionRepository.exists(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(false);

        when(userRepository.getReferenceById(juryId)).thenReturn(jury);
        when(submissionRepository.getReferenceById(submissionId)).thenReturn(submission);

        when(submissionRepository.findById(submissionId))
                .thenReturn(Optional.of(submission));

        Submission result = service.setJury(submissionId, juryId);

        ArgumentCaptor<JurySubmission> captor =
                ArgumentCaptor.forClass(JurySubmission.class);

        verify(jurySubmissionRepository).save(captor.capture());

        JurySubmission saved = captor.getValue();

        assertEquals(jury, saved.getJury());
        assertEquals(submission, saved.getSubmission());

        assertEquals(submission, result);

        verify(jurySubmissionRepository).exists(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verify(userRepository).getReferenceById(juryId);
        verify(submissionRepository).getReferenceById(submissionId);
        verify(submissionRepository).findById(submissionId);

        verifyNoMoreInteractions(
                jurySubmissionRepository,
                userRepository,
                submissionRepository
        );
    }

    @Test
    void setJury_shouldThrowException_whenAlreadyAssigned() {

        when(jurySubmissionRepository.exists(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(true);

        assertThrows(IllegalStateException.class,
                () -> service.setJury(1L, 2L));

        verify(jurySubmissionRepository).exists(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verifyNoInteractions(userRepository, submissionRepository);
    }
}