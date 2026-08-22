package com.gtax.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

/** Static, predefined filing dates (TRD §4, seeded once). View-only for MVP. */
@Entity
@Table(name = "tax_deadlines")
@Getter
@Setter
@NoArgsConstructor
public class TaxDeadline {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description")
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Column(name = "applicable_to")
    private String applicableTo;
}
