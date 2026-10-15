package com.example.zenve_vet.vetnetwork.controller;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.vetnetwork.dto.FollowRequest;
import com.example.zenve_vet.vetnetwork.dto.FollowResponse;
import com.example.zenve_vet.vetnetwork.dto.VetRequest;
import com.example.zenve_vet.vetnetwork.dto.VetResponse;
import com.example.zenve_vet.vetnetwork.service.VetService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vets")
public class VetController {

    private final VetService vetService;

    public VetController(VetService vetService) {
        this.vetService = vetService;
    }

    @GetMapping
    public PageResponse<VetResponse> list(@RequestParam(required = false) String search,
                                          @RequestParam(required = false) String specialty,
                                          @RequestParam(required = false) String city,
                                          @RequestParam(required = false) String state,
                                          @RequestParam(defaultValue = "false") boolean verifiedOnly,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "12") int size,
                                          @RequestParam(required = false) Long viewerId) {
        return vetService.list(search, specialty, city, state, verifiedOnly, page, size, viewerId);
    }

    @GetMapping("/specialties")
    public List<String> specialties() {
        return vetService.specialties();
    }

    @GetMapping("/cities")
    public List<String> cities() {
        return vetService.cities();
    }
    @GetMapping("/states")
    public List<String> states() {
        return vetService.states();
    }

    @GetMapping("/{slug}")
    public VetResponse get(@PathVariable String slug, @RequestParam(required = false) Long viewerId) {
        return vetService.getBySlug(slug, viewerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VetResponse create(@Valid @RequestBody VetRequest request) {
        return vetService.create(request);
    }

    @PutMapping("/{id}")
    public VetResponse update(@PathVariable Long id, @Valid @RequestBody VetRequest request) {
        return vetService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        vetService.delete(id);
    }

    @PostMapping("/{id}/follow")
    public FollowResponse follow(@PathVariable Long id, @Valid @RequestBody FollowRequest request) {
        return vetService.follow(id, request.followerId());
    }

    @DeleteMapping("/{id}/follow")
    public FollowResponse unfollow(@PathVariable Long id, @RequestParam Long followerId) {
        return vetService.unfollow(id, followerId);
    }

    @GetMapping("/{id}/followers")
    public List<VetResponse> followers(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return vetService.followers(id, viewerId);
    }

    @GetMapping("/{id}/following")
    public List<VetResponse> following(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return vetService.following(id, viewerId);
    }
}