package com.gtax.controller;

import com.gtax.dto.DeductionSuggestionResponse;
import com.gtax.dto.ExpenseRequest;
import com.gtax.dto.ExpenseResponse;
import com.gtax.exception.BadRequestException;
import com.gtax.security.SecurityUtils;
import com.gtax.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService service;

    public ExpenseController(ExpenseService service) {
        this.service = service;
    }

    @GetMapping
    public List<ExpenseResponse> list() {
        return service.list(SecurityUtils.currentUserId());
    }

    @GetMapping("/{id}")
    public ExpenseResponse get(@PathVariable UUID id) {
        return service.get(SecurityUtils.currentUserId(), id);
    }

    @PostMapping
    public ResponseEntity<ExpenseResponse> create(@Valid @RequestBody ExpenseRequest req) {
        ExpenseResponse created = service.create(SecurityUtils.currentUserId(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@PathVariable UUID id, @Valid @RequestBody ExpenseRequest req) {
        return service.update(SecurityUtils.currentUserId(), id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(SecurityUtils.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }

    /** Upload a receipt → OCR + categorization → enriched expense (TRD §6). */
    @PostMapping(value = "/upload-receipt", consumes = "multipart/form-data")
    public ResponseEntity<ExpenseResponse> uploadReceipt(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No receipt file was provided");
        }
        ExpenseResponse result = service.uploadReceipt(SecurityUtils.currentUserId(), file);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    /** AI deduction suggestion for a single expense (frontend §10.1). */
    @GetMapping("/{id}/deduction-suggestions")
    public DeductionSuggestionResponse deductionSuggestions(@PathVariable UUID id) {
        return service.deductionSuggestions(SecurityUtils.currentUserId(), id);
    }
}
