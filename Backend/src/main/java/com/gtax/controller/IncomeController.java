package com.gtax.controller;

import com.gtax.dto.IncomeRequest;
import com.gtax.dto.IncomeResponse;
import com.gtax.security.SecurityUtils;
import com.gtax.service.IncomeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/incomes")
public class IncomeController {

    private final IncomeService service;

    public IncomeController(IncomeService service) {
        this.service = service;
    }

    @GetMapping
    public List<IncomeResponse> list() {
        return service.list(SecurityUtils.currentUserId());
    }

    @PostMapping
    public ResponseEntity<IncomeResponse> create(@Valid @RequestBody IncomeRequest req) {
        IncomeResponse created = service.create(SecurityUtils.currentUserId(), req);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public IncomeResponse update(@PathVariable UUID id, @Valid @RequestBody IncomeRequest req) {
        return service.update(SecurityUtils.currentUserId(), id, req);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        service.delete(SecurityUtils.currentUserId(), id);
        return ResponseEntity.noContent().build();
    }
}
