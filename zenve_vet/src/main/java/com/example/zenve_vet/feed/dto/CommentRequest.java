package com.example.zenve_vet.feed.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CommentRequest(@NotNull Long authorId, @NotBlank String body) {
}