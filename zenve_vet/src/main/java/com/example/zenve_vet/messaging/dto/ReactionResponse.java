package com.example.zenve_vet.messaging.dto;

/** One emoji on a message, already counted. */
public record ReactionResponse(String emoji, long count, boolean reactedByMe) {
}
