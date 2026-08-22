package com.gtax.service;

import com.gtax.config.GtaxProperties;
import com.gtax.dto.TaxEstimateResponse;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for the pure slab calculation (TRD §9). The repositories are unused
 * by {@link TaxCalculationService#calculate}, so they can be null here.
 */
class TaxCalculationServiceTest {

    private TaxCalculationService service() {
        GtaxProperties props = new GtaxProperties(
                new GtaxProperties.Supabase("", "", "receipts"),
                new GtaxProperties.Ai("http://localhost:8000", "k"),
                new GtaxProperties.Tax(50_000, 4),
                new GtaxProperties.Cors("http://localhost:5173"));
        return new TaxCalculationService(null, null, props);
    }

    @Test
    void incomeBelowExemptionYieldsZeroTax() {
        TaxEstimateResponse r = service().calculate(bd(200_000), bd(0), "FY");
        assertThat(r.taxableIncome()).isEqualByComparingTo("150000.00");
        assertThat(r.estimatedTax()).isEqualByComparingTo("0.00");
    }

    @Test
    void secondSlabOnly() {
        // taxable = 600000 - 50000 - 50000 = 500000 -> 250k taxed at 5% = 12500
        TaxEstimateResponse r = service().calculate(bd(600_000), bd(50_000), "FY");
        assertThat(r.taxableIncome()).isEqualByComparingTo("500000.00");
        assertThat(r.estimatedTax()).isEqualByComparingTo("12500.00");
    }

    @Test
    void spansAllSlabs() {
        // taxable = 1_600_000 - 100_000 - 50_000 = 1_450_000
        // 250k@0 + 250k@5%(12500) + 500k@20%(100000) + 450k@30%(135000) = 247500
        TaxEstimateResponse r = service().calculate(bd(1_600_000), bd(100_000), "FY");
        assertThat(r.taxableIncome()).isEqualByComparingTo("1450000.00");
        assertThat(r.estimatedTax()).isEqualByComparingTo("247500.00");
        // All four bands appear (incl. the 0% exempt band) since each has a taxable portion.
        assertThat(r.breakdown()).hasSize(4);
    }

    @Test
    void nullAndNegativeInputsClampToZero() {
        TaxEstimateResponse r = service().calculate(null, null, "FY");
        assertThat(r.taxableIncome()).isEqualByComparingTo("0.00");
        assertThat(r.estimatedTax()).isEqualByComparingTo("0.00");
    }

    @Test
    void deductionsCannotDriveTaxableIncomeNegative() {
        TaxEstimateResponse r = service().calculate(bd(100_000), bd(500_000), "FY");
        assertThat(r.taxableIncome()).isEqualByComparingTo("0.00");
        assertThat(r.estimatedTax()).isEqualByComparingTo("0.00");
    }

    private static BigDecimal bd(long v) {
        return BigDecimal.valueOf(v);
    }
}
