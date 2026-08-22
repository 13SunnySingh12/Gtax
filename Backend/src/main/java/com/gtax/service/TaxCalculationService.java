package com.gtax.service;

import com.gtax.config.GtaxProperties;
import com.gtax.dto.SlabBreakdown;
import com.gtax.dto.TaxEstimateResponse;
import com.gtax.model.Expense;
import com.gtax.model.Income;
import com.gtax.repository.ExpenseRepository;
import com.gtax.repository.IncomeRepository;
import com.gtax.util.FinancialYear;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * The single source of truth for tax estimation (TRD §9). Deliberately simple:
 * one region, one slab table, one standard deduction.
 *
 * <pre>
 *   taxable_income = max(0, total_income - deductible_expenses - standard_deduction)
 *   estimated_tax  = sum over slabs of (portion in slab * slab rate)
 * </pre>
 *
 * Both {@code /api/tax/estimate} (reads the DB) and {@code /api/tax/what-if}
 * (uses request-body values, writes nothing) call {@link #calculate} — the exact
 * same function, per the TRD's "reuse the calculation service" note.
 */
@Service
public class TaxCalculationService {

    /** Simplified progressive slabs. {@code upperBound == null} = open-ended top slab. */
    private record Slab(BigDecimal lowerBound, BigDecimal upperBound, BigDecimal ratePercent) {}

    private static final List<Slab> SLABS = List.of(
            new Slab(bd(0),        bd(250_000),  bd(0)),
            new Slab(bd(250_000),  bd(500_000),  bd(5)),
            new Slab(bd(500_000),  bd(1_000_000), bd(20)),
            new Slab(bd(1_000_000), null,         bd(30))
    );

    private final IncomeRepository incomeRepository;
    private final ExpenseRepository expenseRepository;
    private final BigDecimal standardDeduction;
    private final int fyStartMonth;

    public TaxCalculationService(IncomeRepository incomeRepository,
                                 ExpenseRepository expenseRepository,
                                 GtaxProperties props) {
        this.incomeRepository = incomeRepository;
        this.expenseRepository = expenseRepository;
        this.standardDeduction = bd(props.tax().standardDeduction());
        this.fyStartMonth = props.tax().financialYearStartMonth();
    }

    /** Estimate from the user's real data for the current financial year. */
    public TaxEstimateResponse estimateForUser(UUID userId) {
        FinancialYear fy = FinancialYear.containing(LocalDate.now(), fyStartMonth);

        BigDecimal totalIncome = incomeRepository
                .findByUserIdAndIncomeDateBetween(userId, fy.start(), fy.end())
                .stream().map(Income::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal deductibleExpenses = expenseRepository
                .findByUserIdAndDeductibleTrueAndExpenseDateBetween(userId, fy.start(), fy.end())
                .stream().map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return calculate(totalIncome, deductibleExpenses, fy.label());
    }

    /** Pure calculation used by both the estimate and the what-if simulator. */
    public TaxEstimateResponse calculate(BigDecimal totalIncome,
                                         BigDecimal deductibleExpenses,
                                         String financialYearLabel) {
        BigDecimal income = nz(totalIncome);
        BigDecimal deductible = nz(deductibleExpenses);

        BigDecimal taxableIncome = income
                .subtract(deductible)
                .subtract(standardDeduction)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        List<SlabBreakdown> breakdown = new ArrayList<>();
        BigDecimal totalTax = BigDecimal.ZERO;

        for (Slab slab : SLABS) {
            BigDecimal lower = slab.lowerBound();
            BigDecimal upper = slab.upperBound(); // null = unbounded
            if (taxableIncome.compareTo(lower) <= 0) {
                continue; // nothing reaches this slab
            }
            BigDecimal top = (upper == null) ? taxableIncome : taxableIncome.min(upper);
            BigDecimal portion = top.subtract(lower).max(BigDecimal.ZERO);
            if (portion.signum() == 0) {
                continue;
            }
            BigDecimal taxForSlab = portion
                    .multiply(slab.ratePercent())
                    .divide(bd(100), 2, RoundingMode.HALF_UP);
            totalTax = totalTax.add(taxForSlab);
            breakdown.add(new SlabBreakdown(
                    lower, upper,
                    slab.ratePercent(),
                    portion.setScale(2, RoundingMode.HALF_UP),
                    taxForSlab));
        }

        return new TaxEstimateResponse(
                income.setScale(2, RoundingMode.HALF_UP),
                deductible.setScale(2, RoundingMode.HALF_UP),
                standardDeduction.setScale(2, RoundingMode.HALF_UP),
                taxableIncome,
                totalTax.setScale(2, RoundingMode.HALF_UP),
                financialYearLabel,
                breakdown);
    }

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static BigDecimal bd(long v) {
        return BigDecimal.valueOf(v);
    }
}
