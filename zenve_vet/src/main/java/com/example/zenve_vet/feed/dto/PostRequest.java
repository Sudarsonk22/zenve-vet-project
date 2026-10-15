package com.example.zenve_vet.feed.dto;

import com.example.zenve_vet.feed.model.PostType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotNull Long authorId,
        @NotNull PostType type,
        String category,
        @NotBlank @Size(max = 2000) String body,
        String mediaUrl,
        Boolean consentReviewed,
        @Size(max = 1000) String takeaways,
        @Size(max = 60) String topic) {
}