package com.gtax.exception;

/** Thrown when the FastAPI AI service fails or is unreachable. */
public class UpstreamAiException extends RuntimeException {
    public UpstreamAiException(String message) {
        super(message);
    }

    public UpstreamAiException(String message, Throwable cause) {
        super(message, cause);
    }
}
