package com.gtax.controller;

import com.gtax.dto.DeadlineResponse;
import com.gtax.service.DeadlineService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tax")
public class DeadlineController {

    private final DeadlineService service;

    public DeadlineController(DeadlineService service) {
        this.service = service;
    }

    /** List upcoming tax deadlines (TRD §5). Static seed data, read-only. */
    @GetMapping("/deadlines")
    public List<DeadlineResponse> deadlines() {
        return service.upcoming();
    }
}
