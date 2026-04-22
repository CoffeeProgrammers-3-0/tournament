package com.project.backend.services.implementations;

import com.project.backend.auth.utils.SecurityUtil;
import com.project.backend.dto.event.PointsChangedForTeamEvent;
import com.project.backend.models.Category;
import com.project.backend.models.Round;
import com.project.backend.models.Team;
import com.project.backend.models.constants.RoundStatus;
import com.project.backend.models.constants.TournamentStatus;
import com.project.backend.repositories.CategoryRepository;
import com.project.backend.repositories.RoundRepository;
import com.project.backend.repositories.TeamRepository;
import com.project.backend.repositories.specifications.CategorySpecification;
import com.project.backend.repositories.specifications.RoundSpecification;
import com.project.backend.repositories.specifications.TeamSpecification;
import com.project.backend.services.interfaces.CategoryService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Override
    @Transactional
    public Category create(Long roundId, Category category) {

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new EntityNotFoundException("Round with id " + roundId + " not found"));

        if (round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot add categories to an EVALUATED round");
        }

        category.setRound(round);
        return categoryRepository.save(category);
    }

    @Override
    @Transactional
    public Category update(Long categoryId, Category category) {
        Category categoryToUpdate = findById(categoryId);

        Round round = categoryToUpdate.getRound();
        if (round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot update categories in an EVALUATED round");
        }
        List<PointsChangedForTeamEvent> events = new ArrayList<>();
        if(!categoryToUpdate.getWeight().equals(category.getWeight())) {
            categoryToUpdate.setWeight(category.getWeight());
            List<Team> teams = teamRepository.findAll(TeamSpecification.byRoundId(round.getId()));
            events = teams.stream().map(t -> new PointsChangedForTeamEvent(t.getId(), round.getId())).toList();
        }

        categoryToUpdate.setTitle(category.getTitle());
        categoryToUpdate = categoryRepository.save(categoryToUpdate);

        for(PointsChangedForTeamEvent event : events) {
            eventPublisher.publishEvent(event);
        }

        return categoryToUpdate;
    }

    @Override
    @Transactional
    public void delete(Long categoryId) {
        Category category = findById(categoryId);

        Round round = category.getRound();
        if (round.getStatus() == RoundStatus.EVALUATED) {
            throw new IllegalStateException("Cannot delete categories from an EVALUATED round");
        }

        if (!category.getCriteria().isEmpty()) {
            throw new IllegalStateException("Cannot delete category with existing criteria");
        }
        categoryRepository.delete(category);

        List<Team> teams = teamRepository.findAll(TeamSpecification.byRoundId(round.getId()));
        List<PointsChangedForTeamEvent> events = teams.stream().map(t -> new PointsChangedForTeamEvent(t.getId(), round.getId())).toList();

        for(PointsChangedForTeamEvent event : events) {
            eventPublisher.publishEvent(event);
        }
    }

    private Category findById(Long categoryId) {
        checkDraftAccessRoundCategory(categoryId);
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new EntityNotFoundException("Category with id " + categoryId + " not found"));
    }

    @Override
    public List<Category> findAllByRound(Long roundId, String search) {
        checkDraftAccessRound(roundId);
        return categoryRepository.findAll(
                Specification.allOf(
                        CategorySpecification.byRoundId(roundId),
                        CategorySpecification.byTitle(search)
                ),
                Sort.by(Sort.Direction.ASC, "title")
        );
    }

    private void checkDraftAccessRoundCategory(Long categoryId) {
        if (!SecurityUtil.isAdmin()) {
            Round round = roundRepository.findOne(RoundSpecification.byCategoryId(categoryId))
                    .orElseThrow(() -> new EntityNotFoundException("Round not found"));

            if (round.getTournament().getStatus() == TournamentStatus.DRAFT || round.getStatus() == RoundStatus.DRAFT) {
                throw new EntityNotFoundException("Round not found");
            }
        }
    }

    private void checkDraftAccessRound(Long roundId) {
        if (!SecurityUtil.isAdmin()) {
            Round round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new EntityNotFoundException("Round not found"));

            if (round.getTournament().getStatus() == TournamentStatus.DRAFT || round.getStatus() == RoundStatus.DRAFT) {
                throw new EntityNotFoundException("Round not found");
            }
        }
    }
}