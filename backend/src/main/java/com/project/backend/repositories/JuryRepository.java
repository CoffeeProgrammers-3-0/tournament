package com.project.backend.repositories;

import com.project.backend.models.ids.JuryId;
import com.project.backend.models.join_tables.Jury;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface JuryRepository extends JpaRepository<Jury, JuryId>, JpaSpecificationExecutor<Jury> {
}