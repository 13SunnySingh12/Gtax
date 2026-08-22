package com.gtax.service;

import com.gtax.config.GtaxProperties;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Deleting an expense must also delete its stored receipt file, which depends on
 * recovering the object path from the URL we saved. These cases cover the signed
 * URL, the plain object URL, and inputs we must not act on.
 */
class SupabaseStorageServiceTest {

    private static final String BASE = "https://proj.supabase.co";

    private SupabaseStorageService service() {
        GtaxProperties props = new GtaxProperties(
                new GtaxProperties.Supabase(BASE, "service-key", "receipts"),
                new GtaxProperties.Ai("http://localhost:8000", "k"),
                new GtaxProperties.Tax(50_000, 4),
                new GtaxProperties.Cors("http://localhost:5173"));
        return new SupabaseStorageService(null, props);
    }

    @Test
    void extractsPathFromSignedUrl() {
        String url = BASE + "/storage/v1/object/sign/receipts/user-1/file-2.png?token=abc.def";
        assertThat(service().objectPathFrom(url)).isEqualTo("user-1/file-2.png");
    }

    @Test
    void extractsPathFromPlainObjectUrl() {
        String url = BASE + "/storage/v1/object/receipts/user-1/file-2.png";
        assertThat(service().objectPathFrom(url)).isEqualTo("user-1/file-2.png");
    }

    @Test
    void returnsNullForUnrelatedOrEmptyUrls() {
        assertThat(service().objectPathFrom(null)).isNull();
        assertThat(service().objectPathFrom("")).isNull();
        assertThat(service().objectPathFrom("https://example.com/some/other/file.png")).isNull();
    }
}
