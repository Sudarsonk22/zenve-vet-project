package com.example.zenve_vet.messaging.dto;

/** Shape the upload endpoint returns and the message endpoint echoes back. */
public record AttachmentResponse(
        Long id,
        String url,
        String fileName,
        String contentType,
        long size
) {
}
