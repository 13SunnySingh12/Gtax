package com.gtax.exception;

/** Thrown when a requested resource does not exist or is not owned by the caller. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
