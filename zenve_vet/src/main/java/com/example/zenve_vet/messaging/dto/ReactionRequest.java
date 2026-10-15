package com.example.zenve_vet.messaging.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Body of POST /messages/{id}/reactions. */
public record ReactionRequest(@NotBlank @Size(max = 16) String emoji) {
}
