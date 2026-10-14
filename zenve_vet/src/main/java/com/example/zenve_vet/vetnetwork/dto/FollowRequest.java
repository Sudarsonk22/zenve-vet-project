package com.example.zenve_vet.vetnetwork.dto;

import jakarta.validation.constraints.NotNull;

public record FollowRequest(@NotNull(message = "followerId is required") Long followerId) {
}