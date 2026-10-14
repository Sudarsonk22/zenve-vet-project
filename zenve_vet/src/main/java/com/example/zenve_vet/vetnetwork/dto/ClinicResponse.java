package com.example.zenve_vet.vetnetwork.dto;

import java.util.List;

public record ClinicResponse(
        Long id,
        Long vetId,
        String name,
        String location,
        String address,
        String phone,
        String openingHours,
        List<String> services,
        String about,
        String photoUrl) {
}