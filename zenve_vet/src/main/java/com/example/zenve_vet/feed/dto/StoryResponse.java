package com.example.zenve_vet.feed.dto;

import java.time.LocalDateTime;

public record StoryResponse(AuthorSummary author, int storyCount, LocalDateTime latestAt) {
}