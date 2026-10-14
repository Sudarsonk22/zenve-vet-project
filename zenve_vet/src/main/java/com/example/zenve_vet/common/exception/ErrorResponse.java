package com.example.zenve_vet.common.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ErrorResponse(Map<String, String> fieldErrors, String message, int status, LocalDateTime timestamp) {

    public static ErrorResponse of(int status, String message) {
        return new ErrorResponse(null, message, status, LocalDateTime.now());
    }
}