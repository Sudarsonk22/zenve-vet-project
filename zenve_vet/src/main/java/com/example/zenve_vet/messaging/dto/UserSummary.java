package com.example.zenve_vet.messaging.dto;

/**
 * A person as the messaging UI needs them.
 *
 * <p>Field names match what the frontend mapper already reads
 * ({@code name}, {@code profileImageUrl}, {@code specialization}, {@code location}),
 * so no mapping layer had to be added on that side.
 */
public record UserSummary(
        Long id,
        String name,
        String profileImageUrl,
        String specialization,
        String location,
        String bio,
        boolean online,
        boolean self
) {
}
