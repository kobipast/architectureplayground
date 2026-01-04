package com.kobipast.userservice.architecture.error;

import com.kobipast.userservice.architecture.observability.CorrelationIdFilter;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.net.URI;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ProblemDetail handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.BAD_REQUEST);
        pd.setType(URI.create("https://example.com/problems/validation"));
        pd.setTitle("Validation failed");
        pd.setDetail("One or more fields are invalid");
        pd.setInstance(URI.create(request.getRequestURI()));

        Map<String, String> errors = new LinkedHashMap<>();
        for (var err : ex.getBindingResult().getAllErrors()) {
            if (err instanceof FieldError fe) {
                errors.put(fe.getField(), fe.getDefaultMessage());
            } else {
                errors.put(err.getObjectName(), err.getDefaultMessage());
            }
        }

        pd.setProperty("errors", errors);
        pd.setProperty("correlationId", request.getHeader(CorrelationIdFilter.HEADER));
        return pd;
    }

    @ExceptionHandler(Exception.class)
    public ProblemDetail handleGeneric(Exception ex, HttpServletRequest request) {
        ProblemDetail pd = ProblemDetail.forStatus(HttpStatus.INTERNAL_SERVER_ERROR);
        pd.setType(URI.create("https://example.com/problems/internal"));
        pd.setTitle("Internal Server Error");
        pd.setDetail(ex.getMessage());
        pd.setInstance(URI.create(request.getRequestURI()));
        pd.setProperty("correlationId", request.getHeader(CorrelationIdFilter.HEADER));
        return pd;
    }
}
