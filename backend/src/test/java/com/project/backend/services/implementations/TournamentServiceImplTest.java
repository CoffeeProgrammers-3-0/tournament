//package com.project.backend.services.implementations;
//
//import com.project.backend.models.Tournament;
//import com.project.backend.models.User;
//import com.project.backend.models.constants.TournamentStatus;
//import com.project.backend.repositories.TournamentRepository;
//import jakarta.persistence.EntityNotFoundException;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.ArgumentCaptor;
//import org.mockito.Captor;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//import org.springframework.data.domain.Page;
//import org.springframework.data.domain.PageImpl;
//import org.springframework.data.domain.Pageable;
//
//import java.util.List;
//import java.util.Optional;
//
//import static org.junit.jupiter.api.Assertions.*;
//import static org.mockito.Mockito.verify;
//import static org.mockito.Mockito.when;
//
//@ExtendWith(MockitoExtension.class)
//class TournamentServiceImplTest {
//
//    @Mock
//    private TournamentRepository tournamentRepository;
//
//    @InjectMocks
//    private TournamentServiceImpl service;
//
//    @Captor
//    private ArgumentCaptor<Pageable> pageRequestCaptor;
//
//    @Captor
//    private ArgumentCaptor<org.springframework.data.jpa.domain.Specification<Tournament>> specCaptor;
//
//    @Test
//    void create_shouldSaveTournament() {
//        Tournament tournament = new Tournament();
//        tournament.setName("Test Tournament");
//
//        when(tournamentRepository.save(tournament)).thenAnswer(inv -> inv.getArgument(0));
//
//        Tournament result = service.create(tournament);
//
//        assertEquals("Test Tournament", result.getName());
//        verify(tournamentRepository).save(tournament);
//    }
//
//    @Test
//    void update_shouldUpdateTournament() {
//        Long id = 1L;
//        Tournament existing = new Tournament();
//        existing.setName("Old Name");
//
//        Tournament updated = new Tournament();
//        updated.setName("New Name");
//
//        when(tournamentRepository.findById(id)).thenReturn(Optional.of(existing));
//        when(tournamentRepository.save(updated)).thenAnswer(inv -> inv.getArgument(0));
//
//        Tournament result = service.update(id, updated);
//
//        assertEquals("New Name", result.getName());
//        verify(tournamentRepository).findById(id);
//        verify(tournamentRepository).save(updated);
//    }
//
//    @Test
//    void delete_shouldRemoveTournament() {
//        Long id = 1L;
//        Tournament tournament = new Tournament();
//        tournament.setId(id);
//
//        when(tournamentRepository.findById(id)).thenReturn(Optional.of(tournament));
//
//        service.delete(id);
//
//        verify(tournamentRepository).delete(tournament);
//        verify(tournamentRepository).findById(id);
//    }
//
//    @Test
//    void findById_shouldReturnTournament() {
//        Long id = 1L;
//        Tournament tournament = new Tournament();
//        tournament.setId(id);
//
//        when(tournamentRepository.findById(id)).thenReturn(Optional.of(tournament));
//
//        Tournament result = service.findById(id);
//
//        assertEquals(id, result.getId());
//    }
//
//    @Test
//    void findById_shouldThrow_whenNotFound() {
//        Long id = 1L;
//        when(tournamentRepository.findById(id)).thenReturn(Optional.empty());
//
//        assertThrows(EntityNotFoundException.class, () -> service.findById(id));
//    }
//
//    @Test
//    void findAll_shouldReturnPage_withCorrectArguments() {
//        Tournament tournament = new Tournament();
//        Page<Tournament> page = new PageImpl<>(List.of(tournament));
//
//        when(tournamentRepository.findAll(specCaptor.capture(), pageRequestCaptor.capture())).thenReturn(page);
//
//        Page<Tournament> result = service.findAll(0, 10, "search", TournamentStatus.RUNNING);
//
//        assertEquals(1, result.getTotalElements());
//
//        Pageable pageable = pageRequestCaptor.getValue();
//        assertEquals(0, pageable.getPageNumber());
//        assertEquals(10, pageable.getPageSize());
//        assertTrue(pageable.getSort().isSorted());
//        assertEquals("startRegistration", pageable.getSort().getOrderFor("startRegistration").getProperty());
//
//        assertNotNull(specCaptor.getValue());
//    }
//
//    @Test
//    void findAllByUser_shouldReturnPage_withCorrectArguments() {
//        Tournament tournament = new Tournament();
//        User user = new User();
//        user.setId(5L);
//        Page<Tournament> page = new PageImpl<>(List.of(tournament));
//
//        when(tournamentRepository.findAll(specCaptor.capture(), pageRequestCaptor.capture())).thenReturn(page);
//
//        Page<Tournament> result = service.findAllByUser(1, 20, "search", TournamentStatus.RUNNING, user);
//
//        assertEquals(1, result.getTotalElements());
//
//        Pageable pageable = pageRequestCaptor.getValue();
//        assertEquals(1, pageable.getPageNumber());
//        assertEquals(20, pageable.getPageSize());
//        assertNotNull(pageable.getSort().getOrderFor("startRegistration"));
//        assertNotNull(pageable.getSort().getOrderFor("name"));
//
//        assertNotNull(specCaptor.getValue());
//    }
//
//    @Test
//    void findAllByUserNot_shouldReturnPage_withCorrectArguments() {
//        Tournament tournament = new Tournament();
//        User user = new User();
//        user.setId(5L);
//        Page<Tournament> page = new PageImpl<>(List.of(tournament));
//
//        when(tournamentRepository.findAll(specCaptor.capture(), pageRequestCaptor.capture())).thenReturn(page);
//
//        Page<Tournament> result = service.findAllByUserNot(2, 5, "search", TournamentStatus.RUNNING, user);
//
//        assertEquals(1, result.getTotalElements());
//
//        Pageable pageable = pageRequestCaptor.getValue();
//        assertEquals(2, pageable.getPageNumber());
//        assertEquals(5, pageable.getPageSize());
//
//        assertNotNull(specCaptor.getValue());
//    }
//}