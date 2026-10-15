package com.example.zenve_vet.messaging.dto;

import java.time.LocalDateTime;

/** A row in the conversation list. */
public record ConversationResponse(
        Long id,
        UserSummary participant,
        LastMessage lastMessage,
        LocalDateTime lastMessageAt,
        long unreadCount,
        boolean pinned,
        boolean archived
) {

    public record LastMessage(String content, LocalDateTime createdAt, boolean mine) {
    }
}
