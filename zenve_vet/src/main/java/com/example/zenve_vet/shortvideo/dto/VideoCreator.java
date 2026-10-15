package com.example.zenve_vet.shortvideo.dto;

/** The creator strip under a video. Field names match the frontend user mapper. */
public record VideoCreator(
        Long id,
        String name,
        String profileImageUrl,
        String specialization,
        String location,
        boolean following
) {
}
