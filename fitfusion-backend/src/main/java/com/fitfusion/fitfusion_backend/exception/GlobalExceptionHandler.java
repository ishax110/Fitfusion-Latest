package com.fitfusion.fitfusion_backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── Validation errors (@Valid failures) ──────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }

        return ResponseEntity.badRequest().body(Map.of(
                "status",    400,
                "error",     "Validation Failed",
                "message",   "One or more fields are invalid.",
                "fields",    fieldErrors,
                "timestamp", LocalDateTime.now().toString()
        ));
    }

    // ── Business logic errors (bad input, not found, etc.) ───────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(
            IllegalArgumentException ex) {

        return ResponseEntity.badRequest().body(errorBody(
                400, "Bad Request", ex.getMessage()));
    }

    // ── Unauthenticated / illegal state ──────────────────────────────────
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(
            IllegalStateException ex) {

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorBody(
                401, "Unauthorized", ex.getMessage()));
    }

    // ── File too large ────────────────────────────────────────────────────
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleFileTooLarge(
            MaxUploadSizeExceededException ex) {

        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(errorBody(
                413, "File Too Large",
                "Uploaded file exceeds the maximum allowed size of 200 MB."));
    }

    // ── AI / external service failures ───────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntime(
            RuntimeException ex) {

        String message = ex.getMessage() != null ? ex.getMessage() : "Unknown error";
        String cause   = ex.getCause() != null ? ex.getCause().getMessage() : null;

        // Connection refused → MediaPipe or AI service is not running
        boolean isConnectionRefused =
                message.contains("Connection refused") ||
                message.contains("connect") ||
                (cause != null && cause.contains("Connection refused"));

        if (isConnectionRefused || message.contains("AI Workout Service")) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorBody(
                    503, "AI Service Unavailable",
                    "Could not connect to the AI service. " +
                    "Make sure both services are running: " +
                    "AI Service on port 8000 and MediaPipe Service on port 8001."));
        }

        // Video tracking chain failure — surface the real message
        if (message.contains("Video tracking")) {
            String detail = cause != null ? cause : message;
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorBody(
                    503, "Video Tracking Failed", detail));
        }

        // AI workout generation failure — surface the real message
        if (message.contains("AI workout generation")) {
            String detail = cause != null ? cause : message;
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorBody(
                    503, "AI Generation Failed", detail));
        }

        // Everything else → 500, but include the actual message for debugging
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody(
                500, "Internal Server Error", message));
    }

    // ── Catch-all ────────────────────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex) {
        String message = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred.";
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorBody(
                500, "Internal Server Error", message));
    }

    // ── Helper ───────────────────────────────────────────────────────────
    private Map<String, Object> errorBody(int status, String error, String message) {
        Map<String, Object> body = new HashMap<>();
        body.put("status",    status);
        body.put("error",     error);
        body.put("message",   message);
        body.put("timestamp", LocalDateTime.now().toString());
        return body;
    }
}
