package com.example.zenve_vet.advertise.dto;

import jakarta.validation.constraints.NotBlank;

public record AccessRequest(
        @NotBlank(message = "Access key is required") String accessKey) {
}