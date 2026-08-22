package com.gtax.repository;

import com.gtax.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface IncomeRepository extends JpaRepository<Income, UUID> {

    List<Income> findByUserIdOrderByIncomeDateDescCreatedAtDesc(UUID userId);

    Optional<Income> findByIdAndUserId(UUID id, UUID userId);

    List<Income> findByUserIdAndIncomeDateBetween(UUID userId, LocalDate start, LocalDate end);
}
