package com.gtax.service;

import com.gtax.dto.DeadlineResponse;
import com.gtax.repository.TaxDeadlineRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Read-only access to the static tax-deadline calendar (PRD §7, TRD §4).
 * Returns upcoming deadlines soonest-first for the calendar/list view.
 */
@Service
public class DeadlineService {

    private final TaxDeadlineRepository repository;

    public DeadlineService(TaxDeadlineRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<DeadlineResponse> upcoming() {
        List<DeadlineResponse> upcoming = repository
                .findByDueDateGreaterThanEqualOrderByDueDateAsc(LocalDate.now())
                .stream().map(DeadlineResponse::from).toList();
        // If every seeded date is in the past, still show the full list so the
        // calendar is never empty (frontend §8.7 empty-state guard).
        if (upcoming.isEmpty()) {
            return repository.findAllByOrderByDueDateAsc()
                    .stream().map(DeadlineResponse::from).toList();
        }
        return upcoming;
    }
}
