package com.gtax.repository;

import com.gtax.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpenseRepository extends JpaRepository<Expense, UUID> {

    List<Expense> findByUserIdOrderByExpenseDateDescCreatedAtDesc(UUID userId);

    Optional<Expense> findByIdAndUserId(UUID id, UUID userId);

    List<Expense> findByUserIdAndExpenseDateBetween(UUID userId, LocalDate start, LocalDate end);

    List<Expense> findByUserIdAndDeductibleTrueAndExpenseDateBetween(
            UUID userId, LocalDate start, LocalDate end);
}
