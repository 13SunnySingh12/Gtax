package com.gtax.dto;

import com.gtax.model.TaxDeadline;

import java.time.LocalDate;
import java.util.UUID;

public record DeadlineResponse(
        UUID id,
        String title,
        String description,
        LocalDate dueDate,
        String applicableTo
) {
    public static DeadlineResponse from(TaxDeadline d) {
        return new DeadlineResponse(
                d.getId(), d.getTitle(), d.getDescription(), d.getDueDate(), d.getApplicableTo());
    }
}
