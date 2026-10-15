package com.example.zenve_vet.shortvideo.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * One video as the grid and the player need it.
 *
 * <p>{@code liked}, {@code saved} and {@code owner} are resolved per viewer by the
 * server - the client has no way to work them out on its own.
 */
public record VideoResponse(
        Long id,
        String title,
        String description,
        String videoUrl,
        String thumbnailUrl,
        Integer durationSeconds,
        String category,
        String specialty,
        String animalType,
        String caseType,
        String visibility,
        List<String> hashtags,
        int viewCount,
        int likeCount,
        int commentCount,
        int shareCount,
        boolean liked,
        boolean saved,
        boolean owner,
        VideoCreator creator,
        LocalDateTime createdAt
) {
}
