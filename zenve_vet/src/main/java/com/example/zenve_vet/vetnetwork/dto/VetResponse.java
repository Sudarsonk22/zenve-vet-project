package com.example.zenve_vet.vetnetwork.dto;

import java.time.LocalDateTime;

public record VetResponse(Long id, String slug, String fullName, String specialty, String city,
                          String state, String bio, String avatarUrl, boolean verified,
                          long followersCount, long followingCount, boolean following,
                          LocalDateTime createdAt) {
}