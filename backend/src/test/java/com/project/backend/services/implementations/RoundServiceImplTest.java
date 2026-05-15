//package com.project.backend.services.implementations;
//
//import com.project.backend.models.Round;
//import com.project.backend.models.Tournament;
//import com.project.backend.models.User;
//import com.project.backend.models.constants.Role;
//import com.project.backend.models.constants.RoundStatus;
//import com.project.backend.models.join_tables.Jury;
//import com.project.backend.repositories.JuryRepository;
//import com.project.backend.repositories.RoundRepository;
//import com.project.backend.repositories.TournamentRepository;
//import com.project.backend.repositories.UserRepository;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.PageRequest;
//import org.springframework.data.domain.Sort;
//import org.springframework.data.jpa.domain.Specification;
//
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.assertEquals;
//import static org.junit.jupiter.api.Assertions.assertThrows;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class RoundServiceImplTest {
//
//    @Mock
//    private RoundRepository roundRepository;
//
//    @Mock
//    private TournamentRepository tournamentRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @Mock
//    private JuryRepository juryRepository;
//
//    @InjectMocks
//    private RoundServiceImpl service;
//
//    @Test
//    void create_shouldSaveRound() {
//
//        Long tournamentId = 1L;
//
//        Tournament tournament = new Tournament();
//        tournament.setId(tournamentId);
//        tournament.setCountOfRounds(5L);
//
//        Round round = new Round();
//
//        when(tournamentRepository.findOne(
//                argThat((Specification<Tournament> spec) -> spec != null)
//        )).thenReturn(Optional.of(tournament));
//
//        when(roundRepository.count(
//                argThat((Specification<Round> spec) -> spec != null)
//        )).thenReturn(2L);
//
//        when(roundRepository.save(round)).thenReturn(round);
//
//        Round result = service.create(tournamentId, round);
//
//        assertEquals(tournament, result.getTournament());
//
//        verify(tournamentRepository).findOne(
//                argThat((Specification<Tournament> spec) -> spec != null)
//        );
//
//        verify(roundRepository).count(
//                argThat((Specification<Round> spec) -> spec != null)
//        );
//
//        verify(roundRepository).save(round);
//
//        verifyNoMoreInteractions(roundRepository, tournamentRepository);
//    }
//
//    @Test
//    void create_shouldThrowException_whenTournamentFull() {
//
//        Long tournamentId = 1L;
//
//        Tournament tournament = new Tournament();
//        tournament.setCountOfRounds(2L);
//
//        when(tournamentRepository.findOne(
//                argThat((Specification<Tournament> spec) -> spec != null)
//        )).thenReturn(Optional.of(tournament));
//
//        when(roundRepository.count(
//                argThat((Specification<Round> spec) -> spec != null)
//        )).thenReturn(2L);
//
//        assertThrows(IllegalStateException.class,
//                () -> service.create(tournamentId, new Round()));
//
//        verify(tournamentRepository).findOne(
//                argThat((Specification<Tournament> spec) -> spec != null)
//        );
//
//        verify(roundRepository).count(
//                argThat((Specification<Round> spec) -> spec != null)
//        );
//
//        verifyNoMoreInteractions(roundRepository, tournamentRepository);
//    }
//
//    @Test
//    void update_shouldUpdateFields() {
//
//        Long roundId = 1L;
//
//        Round existing = new Round();
//        existing.setId(roundId);
//
//        Round updated = new Round();
//        updated.setName("Round 2");
//        updated.setRequirements("req");
//        updated.setStatus(RoundStatus.ACTIVE);
//        updated.setTask("task");
//        updated.setCountOfWinners(3L);
//
//        when(roundRepository.findById(roundId)).thenReturn(Optional.of(existing));
//        when(roundRepository.save(existing)).thenReturn(existing);
//
//        Round result = service.update(roundId, updated);
//
//        assertEquals("Round 2", result.getName());
//        assertEquals("req", result.getRequirements());
//        assertEquals(RoundStatus.ACTIVE, result.getStatus());
//        assertEquals("task", result.getTask());
//        assertEquals(3, result.getCountOfWinners());
//
//        verify(roundRepository).findById(roundId);
//        verify(roundRepository).save(existing);
//
//        verifyNoMoreInteractions(roundRepository);
//    }
//
//    @Test
//    void delete_shouldDeleteRound() {
//
//        Long roundId = 1L;
//
//        Round round = new Round();
//        round.setId(roundId);
//
//        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));
//
//        service.delete(roundId);
//
//        verify(roundRepository).findById(roundId);
//        verify(roundRepository).delete(round);
//
//        verifyNoMoreInteractions(roundRepository);
//    }
//
//    @Test
//    void findAllByTournament_shouldReturnPage() {
//
//        Long tournamentId = 1L;
//
//        PageRequest pageRequest = PageRequest.of(
//                0, 10, Sort.by(Sort.Direction.ASC, "startDate")
//        );
//
//        Page<Round> page = new PageImpl<>(java.util.List.of(new Round()));
//
//        when(roundRepository.findAll(
//                argThat((Specification<Round> spec) -> spec != null),
//                eq(pageRequest)
//        )).thenReturn(page);
//
//        Page<Round> result = service.findAllByTournament(
//                tournamentId, 0, 10, null, null
//        );
//
//        assertEquals(page, result);
//
//        verify(roundRepository).findAll(
//                argThat((Specification<Round> spec) -> spec != null),
//                eq(pageRequest)
//        );
//
//        verifyNoMoreInteractions(roundRepository);
//    }
//
//    @Test
//    void setJury_shouldSaveJury() {
//
//        Long roundId = 1L;
//        Long userId = 2L;
//
//        Round round = new Round();
//        round.setId(roundId);
//
//        User juryUser = new User();
//        juryUser.setId(userId);
//        juryUser.setRole(Role.JURY);
//
//        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));
//        when(userRepository.findById(userId)).thenReturn(Optional.of(juryUser));
//
//        service.setJury(roundId, userId);
//
//        ArgumentCaptor<Jury> captor = ArgumentCaptor.forClass(Jury.class);
//
//        verify(juryRepository).save(captor.capture());
//
//        Jury saved = captor.getValue();
//
//        assertEquals(roundId, saved.getId().getRoundId());
//        assertEquals(userId, saved.getId().getUserId());
//        assertEquals(round, saved.getRound());
//        assertEquals(juryUser, saved.getUser());
//
//        verify(roundRepository).findById(roundId);
//        verify(userRepository).findById(userId);
//        verify(juryRepository).exists(any(Specification.class));
//
//        verifyNoMoreInteractions(roundRepository, userRepository, juryRepository);
//    }
//
//    @Test
//    void setJury_shouldThrowException_whenUserNotJury() {
//
//        Long roundId = 1L;
//        Long userId = 2L;
//
//        Round round = new Round();
//
//        User user = new User();
//        user.setRole(Role.USER);
//
//        when(roundRepository.findById(roundId)).thenReturn(Optional.of(round));
//        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
//
//        assertThrows(IllegalStateException.class,
//                () -> service.setJury(roundId, userId));
//
//        verify(roundRepository).findById(roundId);
//        verify(userRepository).findById(userId);
//        verify(juryRepository).exists(argThat((Specification<Jury> spec) -> spec != null));
//    }
//}