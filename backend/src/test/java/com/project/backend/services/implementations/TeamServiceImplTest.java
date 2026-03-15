package com.project.backend.services.implementations;

import com.project.backend.dto.team.StatisticResponse;
import com.project.backend.dto.team.StatisticRowDTO;
import com.project.backend.dto.user.UserCreateRequestForTeam;
import com.project.backend.models.Team;
import com.project.backend.models.Tournament;
import com.project.backend.models.User;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.repositories.TeamParticipantRepository;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.repositories.TournamentRepository;
import com.project.backend.services.interfaces.UserService;
import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamServiceImplTest {

    @Mock
    private TeamRepository teamRepository;

    @Mock
    private TeamParticipantRepository teamParticipantRepository;

    @Mock
    private TournamentRepository tournamentRepository;

    @Mock
    private UserService userService;

    @InjectMocks
    private TeamServiceImpl service;
    @Test
    void create_shouldSaveTeam_withParticipants() {
        Long tournamentId = 1L;
        Team team = new Team();
        team.setTeamParticipants(new HashSet<>());

        Tournament tournament = new Tournament();
        tournament.setId(tournamentId);
        tournament.setMaxCountOfTeam(5L);

        UserCreateRequestForTeam userReq = new UserCreateRequestForTeam();
        userReq.setEmail("email@test.com");
        userReq.setFullName("Full Name");
        userReq.setIsLeader(true);

        when(tournamentRepository.findById(tournamentId))
                .thenReturn(Optional.of(tournament));

        when(teamParticipantRepository.exists(
                argThat((Specification<TeamParticipant> spec) -> spec != null)
        )).thenReturn(false);

        User user = new User();
        user.setId(10L);
        when(userService.findUserByEmailOrNull("email@test.com")).thenReturn(user);


        when(teamRepository.save(team)).thenAnswer(inv -> inv.getArgument(0));

        Team result = service.create(tournamentId, List.of(userReq), team);

        assertEquals(1, result.getTeamParticipants().size());
        TeamParticipant participant = result.getTeamParticipants().iterator().next();
        assertTrue(participant.getIsLeader());
        assertEquals(user, participant.getUser());

        verify(teamRepository, times(2)).save(team);
        verify(userService).findUserByEmailOrNull("email@test.com");
    }

    @Test
    void addMember_shouldAddNewUser() {
        Long teamId = 1L;
        Long tournamentId = 2L;
        String email = "email@test.com";

        Team team = new Team();
        team.setId(teamId);
        team.setTeamParticipants(new HashSet<>());

        Tournament tournament = new Tournament();
        tournament.setId(tournamentId);
        tournament.setMaxCountOfTeam(5L);

        UserCreateRequestForTeam userReq = new UserCreateRequestForTeam();
        userReq.setEmail(email);
        userReq.setFullName("Full Name");
        userReq.setIsLeader(true);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(tournamentRepository.findOne(
                argThat((Specification<Tournament> spec) -> spec != null)
        )).thenReturn(Optional.of(tournament));

        User user = new User();
        user.setId(10L);
        user.setEmail(email);
        when(userService.findUserByEmailOrNull(email)).thenReturn(user);
        when(teamRepository.save(team)).thenAnswer(inv -> inv.getArgument(0));

        Team result = service.addMember(teamId, userReq);

        assertEquals(1, result.getTeamParticipants().size());
        TeamParticipant participant = result.getTeamParticipants().iterator().next();
        assertTrue(participant.getIsLeader());
        assertEquals(user, participant.getUser());

        verify(teamRepository, times(2)).save(team);
        verify(userService).findUserByEmailOrNull("email@test.com");
    }

    @Test
    void removeMember_shouldRemoveNonLeader() {
        Long teamId = 1L;

        Team team = new Team();
        team.setId(teamId);
        team.setTeamParticipants(new HashSet<>());
        User user = new User();
        user.setId(1L);
        TeamParticipant tp = new TeamParticipant();
        tp.setUser(user);
        tp.setIsLeader(false);
        team.getTeamParticipants().add(tp);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(teamRepository.save(team)).thenAnswer(inv -> inv.getArgument(0));

        Team result = service.removeMember(1L, 1L);

        assertTrue(result.getTeamParticipants().isEmpty());
        verify(teamRepository).save(team);
    }

    @Test
    void removeMember_shouldThrow_whenLeader() {
        Long teamId = 1L;
        Team team = new Team();
        team.setId(teamId);
        team.setTeamParticipants(new HashSet<>());
        User user = new User();
        user.setId(1L);
        TeamParticipant tp = new TeamParticipant();
        tp.setUser(user);
        tp.setIsLeader(true);
        team.getTeamParticipants().add(tp);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        assertThrows(IllegalStateException.class,
                () -> service.removeMember(1L, 1L));

        verify(teamRepository).findById(teamId);
    }

    @Test
    void setLeader_shouldSetLeaderCorrectly() {
        Long teamId = 1L;
        Team team = new Team();
        team.setId(teamId);
        team.setTeamParticipants(new HashSet<>());

        User user1 = new User();
        user1.setId(1L);
        TeamParticipant tp1 = new TeamParticipant();
        tp1.setUser(user1);
        tp1.setIsLeader(false);

        User user2 = new User();
        user2.setId(2L);
        TeamParticipant tp2 = new TeamParticipant();
        tp2.setUser(user2);
        tp2.setIsLeader(false);

        team.getTeamParticipants().add(tp1);
        team.getTeamParticipants().add(tp2);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(teamRepository.save(any(Team.class))).thenAnswer(inv -> inv.getArgument(0));

        Team result = service.setLeader(1L, 2L);

        assertFalse(tp1.getIsLeader());
        assertTrue(tp2.getIsLeader());
        verify(teamRepository).save(team);
    }

    @Test
    void getStatisticsByRoundForTeam_shouldMapPoints() {
        Long teamId = 1L;
        Long roundId = 2L;

        StatisticRowDTO row = new StatisticRowDTO();
        row.setTeamId(teamId);
        row.setTeamName("TeamName");
        row.setTeamEmail("team@email.com");
        row.setJuryEmail("jury@email.com");
        row.setCriteriaText("Criteria1");
        row.setPoints(10L);

        when(teamRepository.getStatisticsByTeamAndRound(teamId, roundId))
                .thenReturn(List.of(row));

        StatisticResponse response = service.getStatisticsByRoundForTeam(roundId, teamId);

        assertEquals(teamId, response.getId());
        assertEquals("TeamName", response.getName());
        assertEquals("team@email.com", response.getEmail());
        assertEquals(10, response.getPointsPerJury().get("jury@email.com").get("Criteria1").intValue());
    }

    @Test
    void getStatisticsByRoundForUsersTeam_shouldCallGetStatistics() {
        Long userId = 1L;
        Long roundId = 2L;
        User user = new User();
        user.setId(userId);

        Team team = new Team();
        team.setId(3L);

        when(teamRepository.findOne(
                argThat((Specification<Team> spec) -> spec != null)
        )).thenReturn(Optional.of(team));

        TeamServiceImpl spyService = spy(service);
        doReturn(new StatisticResponse()).when(spyService).getStatisticsByRoundForTeam(roundId, team.getId());

        StatisticResponse response = spyService.getStatisticsByRoundForUsersTeam(roundId, user);

        assertNotNull(response);
        verify(teamRepository).findOne(argThat((Specification<Team> spec) -> spec != null));
        verify(spyService).getStatisticsByRoundForTeam(roundId, team.getId());
    }

    @Test
    void check_shouldReturnTrueIfExists() {
        User user = new User();
        user.setId(1L);
        when(teamRepository.exists(
                argThat((org.springframework.data.jpa.domain.Specification<Team> spec) -> spec != null)
        )).thenReturn(true);

        boolean result = service.check(1L, user);

        assertTrue(result);
    }

    @Test
    void check_shouldReturnFalseIfNotExists() {
        User user = new User();
        user.setId(1L);
        when(teamRepository.exists(
                argThat((org.springframework.data.jpa.domain.Specification<Team> spec) -> spec != null)
        )).thenReturn(false);

        boolean result = service.check(1L, user);

        assertFalse(result);
    }

    @Test
    void update_shouldModifyTeamFields() {
        Long teamId = 1L;
        Team team = new Team();
        team.setName("OldName");
        Team updatedTeam = new Team();
        updatedTeam.setName("NewName");
        updatedTeam.setContact("Contact");
        updatedTeam.setOrganization("Org");

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(teamRepository.save(
                argThat(t -> t.getName().equals("NewName") && t.getContact().equals("Contact") && t.getOrganization().equals("Org"))
        )).thenAnswer(inv -> inv.getArgument(0));

        Team result = service.update(teamId, updatedTeam);

        assertEquals("NewName", result.getName());
        assertEquals("Contact", result.getContact());
        assertEquals("Org", result.getOrganization());
    }

    @Test
    void delete_shouldCallRepositoryDelete() {
        Long teamId = 1L;
        Team team = new Team();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        service.delete(teamId);

        verify(teamRepository).delete(team);
    }

    @Test
    void findById_shouldReturnTeam() {
        Long teamId = 1L;
        Team team = new Team();
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        Team result = service.findById(teamId);

        assertEquals(team, result);
    }

    @Test
    void findById_shouldThrowIfNotFound() {
        when(teamRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EntityNotFoundException.class, () -> service.findById(1L));
    }

    @Test
    void findAll_shouldReturnPagedTeams() {
        Team team = new Team();
        Page<Team> page = new PageImpl<>(List.of(team));

        when(teamRepository.findAll(
                argThat((Specification<Team> spec) -> spec != null),
                argThat((PageRequest pr) -> pr.getPageSize() == 10 && pr.getPageNumber() == 0)
        )).thenReturn(page);

        Page<Team> result = service.findAll(0, 10, "search");

        assertEquals(1, result.getContent().size());
        assertEquals(team, result.getContent().get(0));
    }

    @Test
    void findAllByUser_shouldReturnPagedTeams() {
        User user = new User();
        user.setId(1L);
        Team team = new Team();
        Page<Team> page = new PageImpl<>(List.of(team));

        when(teamRepository.findAll(
                argThat((Specification<Team> spec) -> spec != null),
                argThat((PageRequest pr) -> pr.getPageSize() == 10 && pr.getPageNumber() == 0)
        )).thenReturn(page);

        Page<Team> result = service.findAllByUser(user, 0, 10, "search");

        assertEquals(1, result.getContent().size());
    }

    @Test
    void addMember_shouldThrowIfTeamFull() {
        Long teamId = 1L;
        Team team = new Team();
        team.setTeamParticipants(new HashSet<>());
        Tournament tournament = new Tournament();
        tournament.setMaxCountOfTeam(0L);

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(tournamentRepository.findOne(argThat((Specification<Tournament> spec) -> spec != null))).thenReturn(Optional.of(tournament));

        UserCreateRequestForTeam request = new UserCreateRequestForTeam();
        request.setEmail("email@test.com");

        assertThrows(IllegalStateException.class, () -> service.addMember(teamId, request));
    }

    @Test
    void setLeader_shouldThrowIfUserNotInTeam() {
        Long teamId = 1L;
        Team team = new Team();
        team.setTeamParticipants(new HashSet<>());

        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));

        assertThrows(IllegalArgumentException.class, () -> service.setLeader(teamId, 1L));
    }
}