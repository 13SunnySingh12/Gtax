package com.gtax.service;

import com.gtax.dto.*;
import com.gtax.dto.ai.*;
import com.gtax.exception.NotFoundException;
import com.gtax.exception.UpstreamAiException;
import com.gtax.model.Expense;
import com.gtax.model.OcrStatus;
import com.gtax.model.Receipt;
import com.gtax.repository.ExpenseRepository;
import com.gtax.repository.ReceiptRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

/**
 * Expense CRUD plus the full receipt-upload orchestration (TRD §6/§8):
 * store file → OCR → categorize → persist → return an enriched expense.
 * Every AI step is optional: if it fails the expense still saves so the user
 * can fill it in manually (frontend "never block on AI" principle).
 */
@Service
public class ExpenseService {

    private static final Logger log = LoggerFactory.getLogger(ExpenseService.class);
    /** Above this size we let the AI service fetch the file itself. */
    private static final int MAX_INLINE_BYTES = 6 * 1024 * 1024;

    private final ExpenseRepository expenseRepository;
    private final ReceiptRepository receiptRepository;
    private final SupabaseStorageService storageService;
    private final FastApiClientService aiClient;

    public ExpenseService(ExpenseRepository expenseRepository,
                          ReceiptRepository receiptRepository,
                          SupabaseStorageService storageService,
                          FastApiClientService aiClient) {
        this.expenseRepository = expenseRepository;
        this.receiptRepository = receiptRepository;
        this.storageService = storageService;
        this.aiClient = aiClient;
    }

    // -------------------------------------------------------------- CRUD

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(UUID userId) {
        List<Expense> expenses = expenseRepository.findByUserIdOrderByExpenseDateDescCreatedAtDesc(userId);
        Map<UUID, Receipt> receiptsByExpense = new HashMap<>();
        for (Receipt r : receiptRepository.findByUserIdOrderByCreatedAtDesc(userId)) {
            if (r.getExpenseId() != null) {
                receiptsByExpense.putIfAbsent(r.getExpenseId(), r);
            }
        }
        return expenses.stream()
                .map(e -> ExpenseResponse.from(e, receiptsByExpense.get(e.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse get(UUID userId, UUID id) {
        Expense e = requireExpense(userId, id);
        Receipt r = receiptRepository.findByExpenseIdAndUserId(id, userId).orElse(null);
        return ExpenseResponse.from(e, r);
    }

    @Transactional
    public ExpenseResponse create(UUID userId, ExpenseRequest req) {
        Expense e = new Expense();
        e.setUserId(userId);
        apply(e, req);
        return ExpenseResponse.from(expenseRepository.save(e));
    }

    @Transactional
    public ExpenseResponse update(UUID userId, UUID id, ExpenseRequest req) {
        Expense e = requireExpense(userId, id);
        apply(e, req);
        Expense saved = expenseRepository.save(e);
        Receipt r = receiptRepository.findByExpenseIdAndUserId(id, userId).orElse(null);
        return ExpenseResponse.from(saved, r);
    }

    @Transactional
    public void delete(UUID userId, UUID id) {
        Expense e = requireExpense(userId, id);
        // The receipts ROW cascades via the FK, but the stored FILE would be left
        // behind, so remove it first (best-effort - never blocks the delete).
        receiptRepository.findByExpenseIdAndUserId(id, userId)
                .ifPresent(r -> storageService.deleteReceipt(r.getFileUrl()));
        expenseRepository.delete(e);
    }

    // ------------------------------------------------- Receipt upload flow

    /**
     * Store the receipt, run OCR + categorization through FastAPI, and persist an
     * enriched expense (TRD §6). Returns the expense with OCR data + AI category.
     */
    @Transactional
    public ExpenseResponse uploadReceipt(UUID userId, MultipartFile file) {
        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new UpstreamAiException("Could not read the uploaded file", ex);
        }
        String contentType = file.getContentType();
        String fileUrl = storageService.uploadReceipt(
                userId, file.getOriginalFilename(), bytes, contentType);

        // Persist a placeholder expense + receipt first so we always have a record.
        Expense expense = new Expense();
        expense.setUserId(userId);
        expense.setAmount(BigDecimal.ZERO);
        expense.setExpenseDate(LocalDate.now());
        expense = expenseRepository.save(expense);

        Receipt receipt = new Receipt();
        receipt.setUserId(userId);
        receipt.setExpenseId(expense.getId());
        receipt.setFileUrl(fileUrl);
        receipt.setOcrStatus(OcrStatus.PROCESSING.dbValue());
        receipt = receiptRepository.save(receipt);

        // ---- OCR (optional) ----
        String extractedText = null;
        try {
            // Pass the bytes we already hold so the AI service does not have to
            // download the image back from Storage (saves a full internet round
            // trip). Very large files still fall back to the URL.
            String inline = bytes.length <= MAX_INLINE_BYTES
                    ? Base64.getEncoder().encodeToString(bytes) : null;
            AiOcrResponse ocr = aiClient.extractReceipt(
                    new AiOcrRequest(fileUrl, contentType, inline));
            extractedText = ocr.rawText();
            receipt.setOcrRawText(ocr.rawText());
            receipt.setOcrStatus("failed".equalsIgnoreCase(ocr.status())
                    ? OcrStatus.FAILED.dbValue() : OcrStatus.DONE.dbValue());
            if (ocr.amount() != null) {
                expense.setAmount(ocr.amount());
            }
            if (ocr.vendor() != null && !ocr.vendor().isBlank()) {
                expense.setVendor(ocr.vendor());
            }
            LocalDate parsedDate = parseDate(ocr.date());
            if (parsedDate != null) {
                expense.setExpenseDate(parsedDate);
            }
        } catch (UpstreamAiException ex) {
            log.warn("OCR failed for receipt {}: {}", receipt.getId(), ex.getMessage());
            receipt.setOcrStatus(OcrStatus.FAILED.dbValue());
        }

        // ---- Categorization (optional) ----
        // If OCR produced neither text nor a vendor there is nothing to classify,
        // so skip the call entirely rather than burning another AI round trip
        // (and another timeout) on an empty prompt.
        String basisText = (extractedText != null && !extractedText.isBlank())
                ? extractedText : expense.getVendor();
        if (basisText == null || basisText.isBlank()) {
            log.info("Skipping categorization - OCR returned no usable text for expense {}",
                    expense.getId());
            receiptRepository.save(receipt);
            return ExpenseResponse.from(expenseRepository.save(expense), receipt);
        }
        try {
            AiCategorizeResponse cat = aiClient.categorize(
                    new AiCategorizeRequest(basisText, expense.getVendor(), expense.getAmount()));
            if (cat.category() != null && !cat.category().isBlank()) {
                expense.setAiSuggestedCategory(cat.category());
            }
            if (Boolean.TRUE.equals(cat.isDeductible())) {
                expense.setDeductible(true);
                expense.setDeductionReason(cat.reason());
            }
        } catch (UpstreamAiException ex) {
            log.warn("Categorization failed for expense {}: {}", expense.getId(), ex.getMessage());
        }

        receiptRepository.save(receipt);
        Expense saved = expenseRepository.save(expense);
        return ExpenseResponse.from(saved, receipt);
    }

    // --------------------------------------------- Deduction suggestion

    /** RAG-based deduction suggestion for one expense (frontend §10.1). */
    @Transactional(readOnly = true)
    public DeductionSuggestionResponse deductionSuggestions(UUID userId, UUID id) {
        Expense e = requireExpense(userId, id);
        String description = Optional.ofNullable(e.getCategory())
                .orElse(Optional.ofNullable(e.getAiSuggestedCategory()).orElse(""));
        AiDeductionResponse ai = aiClient.suggestDeduction(new AiDeductionRequest(
                e.getVendor(), e.getAmount(), e.getCategory(), description));
        return new DeductionSuggestionResponse(
                e.getId(),
                ai.suggestedCategory(),
                ai.deductionAmount(),
                ai.likelihood(),
                ai.reason(),
                ai.sources() == null ? List.of() : ai.sources());
    }

    // --------------------------------------------------------- helpers

    private Expense requireExpense(UUID userId, UUID id) {
        return expenseRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new NotFoundException("Expense not found"));
    }

    private void apply(Expense e, ExpenseRequest req) {
        e.setAmount(req.amount());
        e.setVendor(req.vendor());
        e.setExpenseDate(req.expenseDate());
        e.setCategory(req.category());
        if (req.isDeductible() != null) {
            e.setDeductible(req.isDeductible());
        }
        e.setDeductionReason(req.deductionReason());
    }

    private LocalDate parseDate(String iso) {
        if (iso == null || iso.isBlank()) return null;
        try {
            return LocalDate.parse(iso.trim());
        } catch (DateTimeParseException ex) {
            return null;
        }
    }
}
