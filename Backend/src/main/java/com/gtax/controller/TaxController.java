package com.gtax.controller;

import com.gtax.dto.TaxEstimateResponse;
import com.gtax.dto.WhatIfRequest;
import com.gtax.security.SecurityUtils;
import com.gtax.service.TaxCalculationService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tax")
public class TaxController {

    private final TaxCalculationService taxService;

    public TaxController(TaxCalculationService taxService) {
        this.taxService = taxService;
    }

    /** Current estimate from the user's real income/expense data (TRD §9). */
    @GetMapping("/estimate")
    public TaxEstimateResponse estimate() {
        return taxService.estimateForUser(SecurityUtils.currentUserId());
    }

    /** Hypothetical calculation — same slab logic, nothing persisted (TRD §9). */
    @PostMapping("/what-if")
    public TaxEstimateResponse whatIf(@Valid @RequestBody WhatIfRequest req) {
        return taxService.calculate(req.totalIncome(), req.deductibleExpenses(), "What-if");
    }
}
