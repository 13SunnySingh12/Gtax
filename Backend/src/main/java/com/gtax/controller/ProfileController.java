package com.gtax.controller;

import com.gtax.dto.ProfileResponse;
import com.gtax.dto.ProfileUpdateRequest;
import com.gtax.security.SecurityUtils;
import com.gtax.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

/**
 * Authenticated user's profile + onboarding state (closes the TRD/API gap noted
 * in the frontend design §21). Powers onboarding and the Profile page.
 */
@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService service;

    public ProfileController(ProfileService service) {
        this.service = service;
    }

    @GetMapping
    public ProfileResponse get() {
        return service.getOrCreate(SecurityUtils.currentUserId(), SecurityUtils.currentUserEmail());
    }

    @PutMapping
    public ProfileResponse update(@Valid @RequestBody ProfileUpdateRequest req) {
        return service.update(SecurityUtils.currentUserId(), SecurityUtils.currentUserEmail(), req);
    }
}
