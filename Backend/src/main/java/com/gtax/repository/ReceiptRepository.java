package com.gtax.repository;

import com.gtax.model.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReceiptRepository extends JpaRepository<Receipt, UUID> {

    Optional<Receipt> findByExpenseIdAndUserId(UUID expenseId, UUID userId);

    List<Receipt> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
