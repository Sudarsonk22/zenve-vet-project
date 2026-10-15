package com.example.zenve_vet.messaging.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * One message.
 *
 * <p>{@code mine} is decided by the server rather than left to the client to work
 * out from {@code senderId} - the UI leans on it to pick a side for every bubble.
 */
public record MessageResponse(
        Long id,
        Long conversationId,
        String content,
        LocalDateTime createdAt,
        Long senderId,
        String senderName,
        boolean mine,
        String status,
        List<AttachmentResponse> attachments,
        ReplyPreview replyTo,
        List<ReactionResponse> reactions
) {
}
