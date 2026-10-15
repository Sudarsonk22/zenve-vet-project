package com.example.zenve_vet.advertise.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record AdvertiserRequest(
        @NotBlank(message = "Brand name is required") String brandName,
        @NotBlank(message = "Contact email is required")
        @Email(message = "Enter a valid email") String email,
        String website) {
}