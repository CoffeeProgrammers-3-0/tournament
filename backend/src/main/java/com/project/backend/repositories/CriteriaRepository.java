package com.project.backend.repositories;

import com.project.backend.models.Criteria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface CriteriaRepository extends JpaRepository<Criteria, Long>, JpaSpecificationExecutor<Criteria> {
}
