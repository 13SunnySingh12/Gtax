package com.gtax.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * 1:1 extension of Supabase {@code auth.users} (TRD §4). {@code id} equals the
 * auth user id; the row is auto-created by a DB trigger on signup. Carries the
 * onboarding/consent state that gates the dashboard for new users.
 */
@Entity
@Table(name = "profiles")
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "gig_type")
    private String gigType;

    @Column(name = "onboarded", nullable = false)
    private boolean onboarded = false;

    @Column(name = "terms_accepted_at")
    private OffsetDateTime termsAcceptedAt;

    @Column(name = "created_at", insertable = false, updatable = false)
    private OffsetDateTime createdAt;
}
