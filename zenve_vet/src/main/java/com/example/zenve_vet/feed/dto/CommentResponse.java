package com.example.zenve_vet.feed.dto;

import java.time.LocalDateTime;

public record CommentResponse(Long id, String body, AuthorSummary author, LocalDateTime createdAt) {
}