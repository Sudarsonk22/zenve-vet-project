package com.example.zenve_vet.messaging.dto;

/** Just enough of the quoted message to render the reply strip above a bubble. */
public record ReplyPreview(Long id, String content, String senderName) {
}
