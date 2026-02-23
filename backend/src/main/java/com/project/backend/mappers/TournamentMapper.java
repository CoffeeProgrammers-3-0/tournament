package com.project.backend.mappers;

import com.project.backend.dto.tournament.TournamentCreateRequest;
import com.project.backend.dto.tournament.TournamentFullResponse;
import com.project.backend.dto.tournament.TournamentListResponse;
import com.project.backend.dto.tournament.TournamentUpdateRequest;
import com.project.backend.models.Tournament;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TournamentMapper {
    Tournament fromCreateRequestToTournament(TournamentCreateRequest tournamentCreateRequest);
    Tournament fromUpdateRequestToTournament(TournamentUpdateRequest tournamentUpdateRequest);

    TournamentListResponse fromTournamentToListResponse(Tournament tournament);
    TournamentFullResponse fromTournamentToFullResponse(Tournament tournament);
}
