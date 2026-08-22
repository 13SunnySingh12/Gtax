package com.gtax.exception;

/** Thrown when the security context has no valid authenticated user. */
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
