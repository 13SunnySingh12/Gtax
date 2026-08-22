package com.gtax.service;

import com.gtax.dto.IncomeRequest;
import com.gtax.dto.IncomeResponse;
import com.gtax.exception.NotFoundException;
import com.gtax.model.Income;
import com.gtax.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class IncomeService {

    private final IncomeRepository repository;

    public IncomeService(IncomeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<IncomeResponse> list(UUID userId) {
        return repository.findByUserIdOrderByIncomeDateDescCreatedAtDesc(userId)
                .stream().map(IncomeResponse::from).toList();
    }

    @Transactional
    public IncomeResponse create(UUID userId, IncomeRequest req) {
        Income income = new Income();
        income.setUserId(userId);
        apply(income, req);
        return IncomeResponse.from(repository.save(income));
    }

    @Transactional
    public IncomeResponse update(UUID userId, UUID id, IncomeRequest req) {
        Income income = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Income not found"));
        apply(income, req);
        return IncomeResponse.from(repository.save(income));
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Income income = repository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Income not found"));
        repository.delete(income);
    }

    private void apply(Income income, IncomeRequest req) {
        income.setSource(req.source());
        income.setAmount(req.amount());
        income.setIncomeDate(req.incomeDate());
        income.setNotes(req.notes());
    }
}
