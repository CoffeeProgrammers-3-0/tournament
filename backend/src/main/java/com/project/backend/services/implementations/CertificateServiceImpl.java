package com.project.backend.services.implementations;

import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.team.TeamLeaderboardResponse;
import com.project.backend.models.*;
import com.project.backend.models.constants.CertificateStatus;
import com.project.backend.models.join_tables.TeamParticipant;
import com.project.backend.repositories.*;
import com.project.backend.repositories.specifications.CertificateSpecification;
import com.project.backend.repositories.specifications.TeamParticipantSpecification;
import com.project.backend.services.interfaces.CertificateService;
import com.project.backend.services.interfaces.FileService;
import com.project.backend.services.interfaces.PDFGeneratorService;
import com.project.backend.services.interfaces.StorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {
    private final CertificateAsyncWorker certificateAsyncWorker;
    private final UserRepository userRepository;
    private final RoundRepository roundRepository;
    private final TeamParticipantRepository teamParticipantRepository;
    private final TeamRepository teamRepository;

    private final CertificateRepository certificateRepository;
    private final FileService fileService;
    private final CertificateTemplateRepository certificateTemplateRepository;
    private final PDFGeneratorService pdfGeneratorService;
    private final StorageService storageService;

    @Value("${storage.local.path}")
    private String storagePath;

    @Override
    public List<Certificate> generateCertificatesForTeams(User creator, Long templateId, Long roundId) {
        CertificateTemplate template = getTemplate(templateId);
        String path = resolveTemplatePath(template);

        Round round = getRound(roundId);
        Tournament tournament = round.getTournament();

        List<TeamLeaderboardResponse> teamsData =
                teamRepository.findLeaderboard(roundId);

        Map<Long, List<TeamParticipant>> participantsByTeam =
                getParticipantsGrouped(tournament.getId());

        Map<Long, Map<String, Object>> datas =
                buildCertificateData(teamsData, participantsByTeam, round, tournament);

        return generateAndSaveCertificates(creator, template, path, datas);
    }

    @Override
    public List<Certificate> generateCertificatesForTeams(
            User creator,
            Long templateId,
            Long roundId,
            List<Long> teamIds
    ) {
        CertificateTemplate template = getTemplate(templateId);
        String path = resolveTemplatePath(template);

        Round round = getRound(roundId);
        Tournament tournament = round.getTournament();

        List<TeamLeaderboardResponse> teamsData =
                teamRepository.findLeaderboardForTeams(roundId, teamIds);

        Map<Long, List<TeamParticipant>> participantsByTeam =
                getParticipantsGrouped(teamIds, tournament.getId());

        Map<Long, Map<String, Object>> datas =
                buildCertificateData(teamsData, participantsByTeam, round, tournament);

        return generateAndSaveCertificates(creator, template, path, datas);
    }

    @Override
    public Certificate generateCertificate(User creator, User receiver, Long templateId, String fileName, Map<String, Object> data) {
        CertificateTemplate template = getTemplate(templateId);
        String path = resolveTemplatePath(template);

        byte[] pdf = pdfGeneratorService.generate(storageService.readAsString(path), data);

        FileRepresentation file = fileService.saveGenerated(
                pdf,
                creator,
                fileName + ".pdf",
                "application/pdf"
        );

        Certificate cert = new Certificate();
        cert.setFile(file);
        cert.setStatus(CertificateStatus.DRAFT);
        cert.setCreator(creator);
        cert.setReceiver(receiver);
        cert.setCertificateTemplate(template);
        cert.setCreatedAt(Instant.now());

        return certificateRepository.save(cert);
    }

    @Override
    public Certificate updateCertificateStatus(Long id, CertificateStatus certificateStatus) {
        Certificate certificate = getCertificateMetaById(id);
        certificate.setStatus(certificateStatus);
        return certificateRepository.save(certificate);
    }

    @Override
    public Certificate getCertificateMetaById(Long id) {
        Certificate certificate = certificateRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Certificate with id " + id + " not found"));

        if(SecurityUtil.isAdmin()) {
            return certificate;
        }

        if(certificate.getStatus() == CertificateStatus.DRAFT) {
            throw new EntityNotFoundException("Certificate with id " + id + " not found");
        }

        return certificate;
    }

    @Override
    public Page<Certificate> findCertificatesByReceiver(Long userId, Integer page, Integer size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));

        Specification<Certificate> spec = CertificateSpecification.byReceiverId(userId);

        if(!SecurityUtil.isAdmin()) {
            spec = Specification.allOf(spec, CertificateSpecification.byStatus(CertificateStatus.READY));
        }

        return certificateRepository.findAll(spec, pageRequest);
    }

    @Override
    public Page<Certificate> findCertificatesByCreator(Long userId,  Integer page, Integer size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));
        return certificateRepository.findAll(CertificateSpecification.byCreatorId(userId), pageRequest);
    }

    @Override
    public Page<Certificate> findAll(Integer page, Integer size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));
        return certificateRepository.findAll(pageRequest);
    }


    private CertificateTemplate getTemplate(Long templateId) {
        return certificateTemplateRepository.findById(templateId)
                .orElseThrow(() -> new EntityNotFoundException("Template not found"));
    }

    private String resolveTemplatePath(CertificateTemplate template) {
        return template.getFile().getPath().replace("/files", storagePath);
    }

    private Round getRound(Long roundId) {
        return roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round not found"));
    }

    private Map<Long, List<TeamParticipant>> getParticipantsGrouped(
            List<Long> teamIds,
            Long tournamentId
    ) {
        List<TeamParticipant> participants = teamParticipantRepository.findAll(
                Specification.allOf(
                        TeamParticipantSpecification.byTournamentId(tournamentId),
                        TeamParticipantSpecification.byTeamIds(teamIds)
                )
        );

        Map<Long, List<TeamParticipant>> result = new HashMap<>();
        for (TeamParticipant tp : participants) {
            result.computeIfAbsent(tp.getTeam().getId(), k -> new ArrayList<>()).add(tp);
        }

        return result;
    }

    private Map<Long, List<TeamParticipant>> getParticipantsGrouped(
            Long tournamentId
    ) {
        List<TeamParticipant> participants = teamParticipantRepository.findAll(
                TeamParticipantSpecification.byTournamentId(tournamentId)
        );

        Map<Long, List<TeamParticipant>> result = new HashMap<>();
        for (TeamParticipant tp : participants) {
            result.computeIfAbsent(tp.getTeam().getId(), k -> new ArrayList<>()).add(tp);
        }

        return result;
    }

    private Map<Long, Map<String, Object>> buildCertificateData(
            List<TeamLeaderboardResponse> teamsData,
            Map<Long, List<TeamParticipant>> byTeamId,
            Round round,
            Tournament tournament
    ) {
        Map<Long, Map<String, Object>> datas = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy")
                .withZone(ZoneId.systemDefault());

        long totalCount = 0;

        for (int i = 0; i < teamsData.size(); i++) {
            TeamLeaderboardResponse team = teamsData.get(i);

            List<TeamParticipant> participants = byTeamId.get(team.getId());
            if (participants == null) continue;

            totalCount += participants.size();

            for (TeamParticipant participant : participants) {
                Map<String, Object> data = new HashMap<>();

                data.put("fullName", participant.getUser().getFullName());
                data.put("place", i + 1);
                data.put("isWinner", totalCount <= round.getCountOfWinners());
                data.put("points", team.getPoints());
                data.put("roundName", round.getName());
                data.put("tournamentName", tournament.getName());
                data.put("teamName", team.getName());
                data.put("certDate",
                        formatter.format(Instant.now())
                );

                datas.put(participant.getUser().getId(), data);
            }
        }

        return datas;
    }

    private List<Certificate> generateAndSaveCertificates(
            User creator,
            CertificateTemplate template,
            String path,
            Map<Long, Map<String, Object>> datas
    ) {
        String templateContent = storageService.readAsString(path);

        List<CompletableFuture<Certificate>> futures = datas.entrySet()
                .stream()
                .map(entry -> certificateAsyncWorker.generate(
                        creator,
                        template,
                        templateContent,
                        entry.getKey(),
                        entry.getValue()
                ))
                .toList();

        return certificateRepository.saveAll(
                CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                        .map(CompletableFuture::join)
                        .toList()
                )
                .join()
        );
    }
}
