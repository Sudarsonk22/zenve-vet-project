package com.example.zenve_vet.advertise.service;

import com.example.zenve_vet.advertise.dto.CampaignRequest;
import com.example.zenve_vet.advertise.dto.CampaignResponse;
import com.example.zenve_vet.advertise.dto.DashboardSummary;
import com.example.zenve_vet.advertise.dto.ReviewRequest;
import com.example.zenve_vet.advertise.model.Advertiser;
import com.example.zenve_vet.advertise.model.Campaign;
import com.example.zenve_vet.advertise.model.CampaignStatus;
import com.example.zenve_vet.advertise.repository.CampaignRepository;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.NotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final AdvertiserService advertiserService;

    public CampaignService(CampaignRepository campaignRepository, AdvertiserService advertiserService) {
        this.campaignRepository = campaignRepository;
        this.advertiserService = advertiserService;
    }

    @Transactional
    public CampaignResponse create(String accessKey, CampaignRequest request) {
        Advertiser advertiser = advertiserService.authenticate(accessKey);

        if (request.endsAt() != null && !request.endsAt().isAfter(request.startsAt())) {
            throw new BadRequestException("End date must be after the start date");
        }

        Campaign campaign = new Campaign();
        campaign.setAdvertiser(advertiser);
        campaign.setHeadline(request.headline().trim());
        campaign.setButtonText(blank(request.buttonText()) ? "Learn more" : request.buttonText().trim());
        campaign.setDestinationUrl(cleanLink(request.destinationUrl()));
        campaign.setPosterUrl(request.posterUrl());
        campaign.setStartsAt(request.startsAt());
        campaign.setEndsAt(request.endsAt());
        return toResponse(campaignRepository.save(campaign));
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> list(String accessKey) {
        Advertiser advertiser = advertiserService.authenticate(accessKey);
        return campaignRepository.findByAdvertiser_IdOrderByCreatedAtDesc(advertiser.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public DashboardSummary summary(String accessKey) {
        Advertiser advertiser = advertiserService.authenticate(accessKey);
        Long id = advertiser.getId();
        return new DashboardSummary(
                campaignRepository.countByAdvertiser_Id(id),
                campaignRepository.countLive(id, LocalDateTime.now()),
                campaignRepository.totalViews(id),
                campaignRepository.totalClicks(id));
    }

    @Transactional
    public void delete(String accessKey, Long campaignId) {
        Advertiser advertiser = advertiserService.authenticate(accessKey);
        Campaign campaign = find(campaignId);
        if (!campaign.getAdvertiser().getId().equals(advertiser.getId())) {
            throw new NotFoundException("Campaign not found");
        }
        campaignRepository.delete(campaign);
    }

    @Transactional(readOnly = true)
    public List<CampaignResponse> listByStatus(CampaignStatus status) {
        return campaignRepository.findByStatusOrderByCreatedAtAsc(status)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public CampaignResponse review(Long campaignId, ReviewRequest request) {
        Campaign campaign = find(campaignId);
        campaign.setStatus(request.approved() ? CampaignStatus.APPROVED : CampaignStatus.REJECTED);
        campaign.setReviewNote(request.note());
        return toResponse(campaignRepository.save(campaign));
    }

    private Campaign find(Long id) {
        return campaignRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Campaign not found"));
    }

    private boolean blank(String text) {
        return text == null || text.isBlank();
    }

    private String cleanLink(String link) {
        String trimmed = link.trim();
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        return "https://" + trimmed;
    }

    private CampaignResponse toResponse(Campaign campaign) {
        return new CampaignResponse(
                campaign.getId(),
                campaign.getAdvertiser().getBrandName(),
                campaign.getHeadline(),
                campaign.getButtonText(),
                campaign.getDestinationUrl(),
                campaign.getPosterUrl(),
                campaign.getStartsAt(),
                campaign.getEndsAt(),
                campaign.getStatus(),
                campaign.getReviewNote(),
                campaign.getViews(),
                campaign.getClicks(),
                campaign.getCreatedAt());
    }
}