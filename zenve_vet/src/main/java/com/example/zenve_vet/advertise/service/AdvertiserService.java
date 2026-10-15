package com.example.zenve_vet.advertise.service;

import com.example.zenve_vet.advertise.dto.AdvertiserRequest;
import com.example.zenve_vet.advertise.dto.AdvertiserResponse;
import com.example.zenve_vet.advertise.model.Advertiser;
import com.example.zenve_vet.advertise.repository.AdvertiserRepository;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.ConflictException;
import com.example.zenve_vet.common.exception.NotFoundException;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.UUID;

@Service
public class AdvertiserService {

    private final AdvertiserRepository advertiserRepository;

    public AdvertiserService(AdvertiserRepository advertiserRepository) {
        this.advertiserRepository = advertiserRepository;
    }

    public AdvertiserResponse create(AdvertiserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (advertiserRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("An advertiser account with this email already exists");
        }

        String key = newKey();
        Advertiser advertiser = new Advertiser();
        advertiser.setBrandName(request.brandName().trim());
        advertiser.setEmail(email);
        advertiser.setWebsite(request.website() == null ? null : request.website().trim());
        advertiser.setAccessKeyHash(hash(key));
        Advertiser saved = advertiserRepository.save(advertiser);
        return toResponse(saved, key);
    }

    public AdvertiserResponse open(String accessKey) {
        return toResponse(authenticate(accessKey), null);
    }

    public Advertiser authenticate(String accessKey) {
        if (accessKey == null || accessKey.isBlank()) {
            throw new BadRequestException("Access key is required");
        }
        return advertiserRepository.findByAccessKeyHash(hash(accessKey.trim()))
                .orElseThrow(() -> new NotFoundException("Access key not found"));
    }

    private String newKey() {
        String random = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        return "ZENVE-ADV:" + random.toUpperCase();
    }

    private String hash(String key) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(key.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    private AdvertiserResponse toResponse(Advertiser advertiser, String accessKey) {
        return new AdvertiserResponse(
                advertiser.getId(),
                advertiser.getBrandName(),
                advertiser.getEmail(),
                advertiser.getWebsite(),
                accessKey,
                advertiser.getCreatedAt());
    }
}