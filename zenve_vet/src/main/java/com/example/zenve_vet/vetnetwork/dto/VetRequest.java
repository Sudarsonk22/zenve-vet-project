package com.example.zenve_vet.vetnetwork.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VetRequest(
        @NotBlank(message = "Name is required") String fullName,
        @NotBlank(message = "Specialty is required") String specialty,
        @NotBlank(message = "City is required") String city,
        String state,
        @Size(max = 1000, message = "Bio can be up to 1000 characters") String bio,
        String avatarUrl) {
}