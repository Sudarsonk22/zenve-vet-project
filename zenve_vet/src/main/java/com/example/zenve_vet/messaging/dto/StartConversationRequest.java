package com.example.zenve_vet.messaging.dto;

import jakarta.validation.constraints.NotNull;

/** Body of POST /conversations - get-or-create a thread with this person. */
public record StartConversationRequest(@NotNull Long participantId) {
}
