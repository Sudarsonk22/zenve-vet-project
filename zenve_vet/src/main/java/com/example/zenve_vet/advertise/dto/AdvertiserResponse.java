package com.example.zenve_vet.advertise.dto;

import java.time.LocalDateTime;

public record AdvertiserResponse(
        Long id,
        String brandName,
        String email,
        String website,
        String accessKey,
        LocalDateTime createdAt) {
}