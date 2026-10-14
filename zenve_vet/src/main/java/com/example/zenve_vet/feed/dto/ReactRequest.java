package com.example.zenve_vet.feed.dto;

import jakarta.validation.constraints.NotNull;

public record ReactRequest(@NotNull(message = "vetId is required") Long vetId) {
}