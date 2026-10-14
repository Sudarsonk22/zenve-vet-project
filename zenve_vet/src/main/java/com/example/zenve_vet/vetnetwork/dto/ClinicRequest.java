package com.example.zenve_vet.vetnetwork.dto;

import jakarta.validation.constraints.NotBlank;

public record ClinicRequest(
        @NotBlank(message = "Clinic name is required") String name,
        String location,
        String address,
        String phone,
        String openingHours,
        String services,
        String about,
        String photoUrl) {
}