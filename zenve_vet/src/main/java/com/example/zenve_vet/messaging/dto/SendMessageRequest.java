package com.example.zenve_vet.messaging.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Body of POST /conversations/{id}/messages.
 *
 * <p>{@code content} is not {@code @NotBlank}: a message may be an attachment with
 * no words. The service rejects the case where both are empty.
 */
public record SendMessageRequest(
        @Size(max = 4000) String content,
        Long replyToId,
        List<Long> attachmentIds
) {
}
