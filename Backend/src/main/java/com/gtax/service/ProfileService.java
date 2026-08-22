package com.gtax.service;

import com.gtax.dto.ProfileResponse;
import com.gtax.dto.ProfileUpdateRequest;
import com.gtax.exception.UnauthorizedException;
import com.gtax.model.Profile;
import com.gtax.repository.ProfileRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

/**
 * Profile read/update + onboarding state. The row is normally created by the
 * Supabase signup trigger; this service self-heals by creating it on first read
 * if it's somehow missing, so the bootstrap flow never dead-ends.
 */
@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public ProfileResponse getOrCreate(UUID userId, String email) {
        Profile profile = repository.findById(userId).orElseGet(() -> persistNew(userId));
        return ProfileResponse.from(profile, email);
    }

    /** Create a fresh profile row; if the auth user no longer exists (stale token),
     * the FK fails — surface a clean 401 so the client re-authenticates. */
    private Profile persistNew(UUID userId) {
        try {
            Profile p = new Profile();
            p.setId(userId);
            return repository.saveAndFlush(p);
        } catch (DataIntegrityViolationException e) {
            throw new UnauthorizedException("Your account was not found. Please sign in again.");
        }
    }

    @Transactional
    public ProfileResponse update(UUID userId, String email, ProfileUpdateRequest req) {
        Profile profile = repository.findById(userId).orElseGet(() -> persistNew(userId));

        if (req.fullName() != null) {
            profile.setFullName(req.fullName().trim());
        }
        if (req.gigType() != null) {
            profile.setGigType(req.gigType().trim());
        }
        if (Boolean.TRUE.equals(req.acceptTerms())) {
            profile.setOnboarded(true);
            if (profile.getTermsAcceptedAt() == null) {
                profile.setTermsAcceptedAt(OffsetDateTime.now());
            }
        }
        return ProfileResponse.from(repository.save(profile), email);
    }
}
