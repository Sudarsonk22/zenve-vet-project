package com.example.zenve_vet.feed.dto;

import java.time.LocalDateTime;

public record ReportResponse(
        Long id,
        Long postId,
        String postBody,
        String reason,
        String details,
        AuthorSummary reporter,
        boolean resolved,
        LocalDateTime createdAt) {
}