package com.gtax.repository;

import com.gtax.model.TaxDeadline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface TaxDeadlineRepository extends JpaRepository<TaxDeadline, UUID> {

    List<TaxDeadline> findByDueDateGreaterThanEqualOrderByDueDateAsc(LocalDate from);

    List<TaxDeadline> findAllByOrderByDueDateAsc();
}
