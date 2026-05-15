package com.project.backend.repositories;

import com.project.backend.models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {
    @Query("""
        SELECT COALESCE(SUM(c.weight * 100), 0)
        FROM Category c
        WHERE c.round.id = :roundId
    """)
    Long calculateMaxPointsPerRoundOnlyDefault(@Param("roundId") Long roundId);
}
