package com.example.zenve_vet.advertise.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record CampaignRequest(
        @NotBlank(message = "Headline is required") String headline,
        String buttonText,
        @NotBlank(message = "Destination link is required") String destinationUrl,
        @NotBlank(message = "Upload a poster") String posterUrl,
        @NotNull(message = "Start date is required") LocalDateTime startsAt,
        LocalDateTime endsAt,
        @AssertTrue(message = "Confirm the advertising guidelines") boolean consent) {
}