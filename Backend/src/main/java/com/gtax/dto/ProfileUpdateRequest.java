package com.gtax.dto;

import jakarta.validation.constraints.Size;

/**
 * Body for PUT /api/profile. Used both by onboarding (with {@code acceptTerms})
 * and by later profile edits. When {@code acceptTerms} is true, the profile is
 * marked onboarded and the consent timestamp is recorded server-side.
 */
public record ProfileUpdateRequest(
        @Size(max = 120, message = "Name is too long")
        String fullName,

        @Size(max = 60, message = "Gig type is too long")
        String gigType,

        Boolean acceptTerms
) {}
