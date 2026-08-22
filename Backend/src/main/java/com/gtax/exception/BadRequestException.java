package com.gtax.exception;

/** Thrown for invalid client input that bean validation didn't already catch. */
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
