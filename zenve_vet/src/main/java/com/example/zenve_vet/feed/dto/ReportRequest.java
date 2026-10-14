package com.example.zenve_vet.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportRequest(
        @NotNull Long reporterId,
        @NotBlank @Size(max = 100) String reason,
        @Size(max = 500) String details) {
}