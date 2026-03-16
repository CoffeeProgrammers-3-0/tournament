package com.project.backend.services.implementations;

import com.project.backend.models.User;
import com.project.backend.models.ids.JurySubmissionCriteriaId;
import com.project.backend.models.join_tables.JurySubmission;
import com.project.backend.models.join_tables.JurySubmissionCriteria;
import com.project.backend.repositories.JurySubmissionCriteriaRepository;
import com.project.backend.repositories.JurySubmissionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JurySubmissionCriteriaServiceImplTest {

    @Mock
    private JurySubmissionCriteriaRepository jurySubmissionCriteriaRepository;

    @Mock
    private JurySubmissionRepository jurySubmissionRepository;

    @InjectMocks
    private JurySubmissionCriteriaServiceImpl service;

    @Test
    void create_shouldCreateCriteriaWithCorrectCompositeId() {

        Long submissionId = 10L;
        Long criteriaId = 5L;
        Long value = 8L;

        User jury = new User();
        jury.setId(3L);

        JurySubmission jurySubmission = new JurySubmission();
        jurySubmission.setId(100L);

        when(jurySubmissionRepository.findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(Optional.of(jurySubmission));

        when(jurySubmissionCriteriaRepository.save(
                argThat(criteria ->
                        criteria.getPoints().equals(value) &&
                                criteria.getId().getCriteriaId().equals(criteriaId) &&
                                criteria.getId().getJurySubmissionId().equals(100L)
                )
        )).thenAnswer(invocation -> invocation.getArgument(0));

        JurySubmissionCriteria result =
                service.create(submissionId, criteriaId, value, jury);

        assertNotNull(result);
        assertEquals(value, result.getPoints());
        assertEquals(criteriaId, result.getId().getCriteriaId());
        assertEquals(100L, result.getId().getJurySubmissionId());

        verify(jurySubmissionRepository).findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verify(jurySubmissionCriteriaRepository).save(
                argThat(criteria ->
                        criteria.getPoints().equals(value) &&
                                criteria.getId().getCriteriaId().equals(criteriaId) &&
                                criteria.getId().getJurySubmissionId().equals(100L)
                )
        );

        verifyNoMoreInteractions(jurySubmissionRepository, jurySubmissionCriteriaRepository);
    }

    @Test
    void create_shouldThrowException_whenJurySubmissionNotFound() {

        User jury = new User();
        jury.setId(1L);

        when(jurySubmissionRepository.findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.create(1L, 2L, 3L, jury));

        verify(jurySubmissionRepository).findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verifyNoInteractions(jurySubmissionCriteriaRepository);
    }

    @Test
    void update_shouldUpdatePoints() {

        Long submissionId = 1L;
        Long criteriaId = 2L;
        Long newPoints = 10L;

        User jury = new User();
        jury.setId(3L);

        JurySubmission jurySubmission = new JurySubmission();
        jurySubmission.setId(50L);

        JurySubmissionCriteria existing = new JurySubmissionCriteria();

        JurySubmissionCriteriaId id = new JurySubmissionCriteriaId();
        id.setJurySubmissionId(50L);
        id.setCriteriaId(criteriaId);

        existing.setId(id);
        existing.setPoints(5L);

        when(jurySubmissionRepository.findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(Optional.of(jurySubmission));

        when(jurySubmissionCriteriaRepository.findOne(
                argThat((Specification<JurySubmissionCriteria> spec) -> spec != null)
        )).thenReturn(Optional.of(existing));

        when(jurySubmissionCriteriaRepository.save(existing))
                .thenReturn(existing);

        JurySubmissionCriteria result =
                service.update(submissionId, criteriaId, newPoints, jury);

        assertEquals(newPoints, result.getPoints());

        verify(jurySubmissionRepository).findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verify(jurySubmissionCriteriaRepository).findOne(
                argThat((Specification<JurySubmissionCriteria> spec) -> spec != null)
        );

        verify(jurySubmissionCriteriaRepository).save(existing);

        verifyNoMoreInteractions(jurySubmissionRepository, jurySubmissionCriteriaRepository);
    }

    @Test
    void update_shouldThrowException_whenCriteriaNotFound() {

        User jury = new User();
        jury.setId(1L);

        JurySubmission jurySubmission = new JurySubmission();
        jurySubmission.setId(10L);

        when(jurySubmissionRepository.findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(Optional.of(jurySubmission));

        when(jurySubmissionCriteriaRepository.findOne(
                argThat((Specification<JurySubmissionCriteria> spec) -> spec != null)
        )).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class,
                () -> service.update(1L, 2L, 5L, jury));

        verify(jurySubmissionRepository).findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verify(jurySubmissionCriteriaRepository).findOne(
                argThat((Specification<JurySubmissionCriteria> spec) -> spec != null)
        );

        verifyNoMoreInteractions(jurySubmissionRepository, jurySubmissionCriteriaRepository);
    }

    @Test
    void findAllBySubmissionForJury_shouldReturnSortedList() {

        Long submissionId = 1L;

        User jury = new User();
        jury.setId(3L);

        JurySubmission jurySubmission = new JurySubmission();
        jurySubmission.setId(100L);

        List<JurySubmissionCriteria> list = List.of(new JurySubmissionCriteria());

        when(jurySubmissionRepository.findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        )).thenReturn(Optional.of(jurySubmission));

        when(jurySubmissionCriteriaRepository.findAll(
                argThat((Specification<JurySubmissionCriteria> spec) -> spec != null),
                eq(Sort.by(Sort.Direction.ASC, "criteria.name"))
        )).thenReturn(list);

        List<JurySubmissionCriteria> result =
                service.findAllBySubmissionForJury(submissionId, jury);

        assertEquals(list, result);

        verify(jurySubmissionRepository).findOne(
                argThat((Specification<JurySubmission> spec) -> spec != null)
        );

        verify(jurySubmissionCriteriaRepository).findAll(
                argThat((Specification<JurySubmissionCriteria> spec) -> spec != null),
                eq(Sort.by(Sort.Direction.ASC, "criteria.name"))
        );

        verifyNoMoreInteractions(jurySubmissionRepository, jurySubmissionCriteriaRepository);
    }
}