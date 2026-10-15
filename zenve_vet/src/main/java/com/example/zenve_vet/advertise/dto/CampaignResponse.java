package com.example.zenve_vet.advertise.dto;

import com.example.zenve_vet.advertise.model.CampaignStatus;

import java.time.LocalDateTime;

public record CampaignResponse(
        Long id,
        String brandName,
        String headline,
        String buttonText,
        String destinationUrl,
        String posterUrl,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        CampaignStatus status,
        String reviewNote,
        long views,
        long clicks,
        LocalDateTime createdAt) {
}