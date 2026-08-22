package com.gtax.util;

import java.time.LocalDate;

/**
 * The financial year window for a single simplified region (TRD §9). Configurable
 * start month (default April), running to the day before that month a year later.
 */
public record FinancialYear(LocalDate start, LocalDate end, String label) {

    /** The financial year that contains {@code reference}, given a start month (1–12). */
    public static FinancialYear containing(LocalDate reference, int startMonth) {
        int m = Math.min(Math.max(startMonth, 1), 12);
        int startYear = reference.getMonthValue() >= m ? reference.getYear() : reference.getYear() - 1;
        LocalDate start = LocalDate.of(startYear, m, 1);
        LocalDate end = start.plusYears(1).minusDays(1);
        String label = (m == 1)
                ? String.valueOf(startYear)
                : "FY " + startYear + "-" + String.format("%02d", (startYear + 1) % 100);
        return new FinancialYear(start, end, label);
    }
}
