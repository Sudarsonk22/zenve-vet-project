package com.example.zenve_vet.advertise.controller;

import com.example.zenve_vet.advertise.dto.AccessRequest;
import com.example.zenve_vet.advertise.dto.AdvertiserRequest;
import com.example.zenve_vet.advertise.dto.AdvertiserResponse;
import com.example.zenve_vet.advertise.service.AdvertiserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/advertisers")
public class AdvertiserController {

    private final AdvertiserService advertiserService;

    public AdvertiserController(AdvertiserService advertiserService) {
        this.advertiserService = advertiserService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public AdvertiserResponse create(@Valid @RequestBody AdvertiserRequest request) {
        return advertiserService.create(request);
    }

    @PostMapping("/access")
    public AdvertiserResponse open(@Valid @RequestBody AccessRequest request) {
        return advertiserService.open(request.accessKey());
    }
}