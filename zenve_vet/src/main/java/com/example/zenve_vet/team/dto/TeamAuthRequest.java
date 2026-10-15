package com.example.zenve_vet.team.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TeamAuthRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Enter a valid email") String email,
        @NotBlank(message = "Password is required")
        @Size(min = 8, message = "Password must be at least 8 characters") String password) {
}