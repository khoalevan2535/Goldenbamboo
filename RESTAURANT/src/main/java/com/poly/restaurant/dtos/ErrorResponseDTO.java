package com.poly.restaurant.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
public class ErrorResponseDTO {
    private int statusCode;
    private String message;
    private String details;
    private LocalDateTime timestamp;

    public ErrorResponseDTO(int statusCode, String message, String details) {
        this.statusCode = statusCode;
        this.message = message;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }
}