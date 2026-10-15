package com.example.zenve_vet.shortvideo.dto;

import java.time.LocalDateTime;

/** A comment under a video. */
public record VideoCommentResponse(
        Long id,
        String content,
        LocalDateTime createdAt,
        VideoCreator author
) {
}
