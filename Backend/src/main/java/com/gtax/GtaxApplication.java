package com.gtax;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

/**
 * G-TAX main backend entry point.
 *
 * <p>Owns all business logic: income/expense CRUD, tax calculation and what-if,
 * the deadline calendar, JWT validation, receipt storage orchestration, and all
 * AI calls to the FastAPI service. React talks only to this service (plus
 * Supabase Auth directly); FastAPI is never called from the browser.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class GtaxApplication {

    public static void main(String[] args) {
        SpringApplication.run(GtaxApplication.class, args);
    }
}
