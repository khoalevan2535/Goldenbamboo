package com.poly.restaurant.exceptions;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.NOT_FOUND) // Khi exception này được ném ra, Spring sẽ trả về HTTP 404 Not Found
public class ResourceNotFoundException extends RuntimeException {

    private static final long serialVersionUID = 1L; 

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}