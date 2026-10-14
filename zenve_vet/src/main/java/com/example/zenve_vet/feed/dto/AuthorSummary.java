package com.example.zenve_vet.feed.dto;

public record AuthorSummary(
        Long id,
        String slug,
        String fullName,
        String specialty,
        String city,
        String state,
        String avatarUrl) {
}