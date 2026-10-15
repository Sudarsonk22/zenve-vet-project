package com.example.zenve_vet.feed.dto;

import com.example.zenve_vet.feed.model.PostType;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        PostType type,
        String category,
        String body,
        String mediaUrl,
        boolean consentReviewed,
        String takeaways,
        String topic,
        AuthorSummary author,
        int viewCount,
        int appreciationCount,
        int commentCount,
        int shareCount,
        boolean appreciated,
        boolean saved,
        LocalDateTime createdAt) {
}