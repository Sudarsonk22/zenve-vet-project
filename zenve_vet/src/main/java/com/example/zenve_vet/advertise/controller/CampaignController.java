package com.example.zenve_vet.advertise.controller;

import com.example.zenve_vet.advertise.dto.CampaignRequest;
import com.example.zenve_vet.advertise.dto.CampaignResponse;
import com.example.zenve_vet.advertise.dto.DashboardSummary;
import com.example.zenve_vet.advertise.dto.ReviewRequest;
import com.example.zenve_vet.advertise.model.CampaignStatus;
import com.example.zenve_vet.advertise.service.CampaignService;
import com.example.zenve_vet.team.service.TeamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CampaignController {

    private static final String KEY = "X-Advertiser-Key";
    private static final String TEAM = "X-Team-Token";

    private final CampaignService campaignService;
    private final TeamService teamService;

    public CampaignController(CampaignService campaignService, TeamService teamService) {
        this.campaignService = campaignService;
        this.teamService = teamService;
    }

    @GetMapping("/advertisers/me/summary")
    public DashboardSummary summary(@RequestHeader(KEY) String key) {
        return campaignService.summary(key);
    }

    @GetMapping("/advertisers/me/campaigns")
    public List<CampaignResponse> list(@RequestHeader(KEY) String key) {
        return campaignService.list(key);
    }

    @PostMapping("/advertisers/me/campaigns")
    @ResponseStatus(HttpStatus.CREATED)
    public CampaignResponse create(@RequestHeader(KEY) String key,
                                   @Valid @RequestBody CampaignRequest request) {
        return campaignService.create(key, request);
    }

    @DeleteMapping("/advertisers/me/campaigns/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(KEY) String key, @PathVariable Long id) {
        campaignService.delete(key, id);
    }

    @GetMapping("/campaigns")
    public List<CampaignResponse> byStatus(@RequestHeader(TEAM) String token,
                                           @RequestParam(defaultValue = "PENDING") CampaignStatus status) {
        teamService.authenticate(token);
        return campaignService.listByStatus(status);
    }

    @PutMapping("/campaigns/{id}/review")
    public CampaignResponse review(@RequestHeader(TEAM) String token,
                                   @PathVariable Long id,
                                   @RequestBody ReviewRequest request) {
        teamService.authenticate(token);
        return campaignService.review(id, request);
    }
}