package com.gtax.dto;

import com.gtax.model.Profile;

import java.time.OffsetDateTime;
import java.util.UUID;

/** The authenticated user's profile, returned by GET/PUT /api/profile. */
public record ProfileResponse(
        UUID id,
        String email,
        String fullName,
        String gigType,
        boolean onboarded,
        OffsetDateTime termsAcceptedAt,
        OffsetDateTime createdAt
) {
    public static ProfileResponse from(Profile p, String email) {
        return new ProfileResponse(
                p.getId(), email, p.getFullName(), p.getGigType(),
                p.isOnboarded(), p.getTermsAcceptedAt(), p.getCreatedAt());
    }
}
