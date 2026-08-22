package com.gtax.dto;

import java.math.BigDecimal;

/**
 * One slab's contribution to the estimate. {@code toAmount} is null for the
 * open-ended top slab. Rendered by the Tax Calculator breakdown table/chart.
 */
public record SlabBreakdown(
        BigDecimal fromAmount,
        BigDecimal toAmount,
        BigDecimal ratePercent,
        BigDecimal taxableInSlab,
        BigDecimal taxForSlab
) {}
