package com.example.zenve_vet.vetnetwork.service;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.ConflictException;
import com.example.zenve_vet.common.exception.NotFoundException;
import com.example.zenve_vet.vetnetwork.dto.FollowResponse;
import com.example.zenve_vet.vetnetwork.dto.VetRequest;
import com.example.zenve_vet.vetnetwork.dto.VetResponse;
import com.example.zenve_vet.vetnetwork.model.Follow;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.FollowRepository;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VetService {

    private final VetRepository vetRepository;
    private final FollowRepository followRepository;

    public VetService(VetRepository vetRepository, FollowRepository followRepository) {
        this.vetRepository = vetRepository;
        this.followRepository = followRepository;
    }

    public PageResponse<VetResponse> list(String search, String specialty, String city, String state,
                                          boolean verifiedOnly, int page, int size, Long viewerId) {
        if (page < 0) {
            throw new BadRequestException("Page cannot be negative");
        }
        if (size < 1 || size > 100) {
            throw new BadRequestException("Page size must be between 1 and 100");
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName"));
        Page<VetProfile> result = vetRepository.search(
                clean(search), clean(specialty), clean(city), clean(state), verifiedOnly, pageable);

        List<VetResponse> items = result.getContent().stream().map(v -> toResponse(v, viewerId)).toList();
        return new PageResponse<>(items, page, size, result.getTotalElements(), result.getTotalPages());
    }

    public VetResponse getBySlug(String slug, Long viewerId) {
        VetProfile vet = vetRepository.findBySlug(slug)
                .orElseThrow(() -> new NotFoundException("Vet not found: " + slug));
        return toResponse(vet, viewerId);
    }

    public VetResponse create(VetRequest req) {
        VetProfile vet = new VetProfile();
        vet.setSlug(makeSlug(req.fullName()));
        fill(vet, req);
        return toResponse(vetRepository.save(vet), null);
    }

    public VetResponse update(Long id, VetRequest req) {
        VetProfile vet = findVet(id);
        fill(vet, req);
        return toResponse(vetRepository.save(vet), null);
    }

    @Transactional
    public void delete(Long id) {
        VetProfile vet = findVet(id);
        followRepository.deleteByFollower_IdOrFollowing_Id(id, id);
        vetRepository.delete(vet);
    }

    @Transactional
    public FollowResponse follow(Long vetId, Long followerId) {
        if (vetId.equals(followerId)) {
            throw new BadRequestException("You cannot follow yourself");
        }

        VetProfile target = findVet(vetId);
        VetProfile follower = findVet(followerId);

        if (followRepository.existsByFollower_IdAndFollowing_Id(followerId, vetId)) {
            throw new ConflictException("You already follow this vet");
        }

        Follow follow = new Follow();
        follow.setFollower(follower);
        follow.setFollowing(target);
        followRepository.save(follow);

        return new FollowResponse(true, followRepository.countByFollowing_Id(vetId));
    }

    @Transactional
    public FollowResponse unfollow(Long vetId, Long followerId) {
        Follow follow = followRepository.findByFollower_IdAndFollowing_Id(followerId, vetId)
                .orElseThrow(() -> new NotFoundException("You are not following this vet"));
        followRepository.delete(follow);

        return new FollowResponse(false, followRepository.countByFollowing_Id(vetId));
    }

    public List<VetResponse> followers(Long vetId, Long viewerId) {
        findVet(vetId);
        return followRepository.findByFollowing_Id(vetId).stream()
                .map(f -> toResponse(f.getFollower(), viewerId))
                .toList();
    }

    public List<VetResponse> following(Long vetId, Long viewerId) {
        findVet(vetId);
        return followRepository.findByFollower_Id(vetId).stream()
                .map(f -> toResponse(f.getFollowing(), viewerId))
                .toList();
    }

    public List<String> specialties() {
        return vetRepository.findSpecialties();
    }

    public List<String> cities() {
        return vetRepository.findCities();
    }
    public List<String> states() {
        return vetRepository.findStates();
    }

    private VetProfile findVet(Long id) {
        return vetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vet not found with id " + id));
    }

    private void fill(VetProfile vet, VetRequest req) {
        vet.setFullName(req.fullName().trim());
        vet.setSpecialty(req.specialty().trim());
        vet.setCity(req.city().trim());
        vet.setState(req.state() == null ? null : req.state().trim());
        vet.setBio(req.bio());
        vet.setAvatarUrl(req.avatarUrl());
    }

    private String makeSlug(String name) {
        String base = name.toLowerCase()
                .replaceFirst("^dr\\.?\\s+", "")
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-|-$", "");
        if (base.isEmpty()) {
            base = "vet";
        }

        String slug = base;
        int number = 2;
        while (vetRepository.existsBySlug(slug)) {
            slug = base + "-" + number;
            number++;
        }
        return slug;
    }

    private String clean(String text) {
        return text == null ? "" : text.trim();
    }

    private VetResponse toResponse(VetProfile v, Long viewerId) {
        boolean following = viewerId != null
                && followRepository.existsByFollower_IdAndFollowing_Id(viewerId, v.getId());

        return new VetResponse(v.getId(), v.getSlug(), v.getFullName(), v.getSpecialty(), v.getCity(),
                v.getState(), v.getBio(), v.getAvatarUrl(), v.isVerified(),
                followRepository.countByFollowing_Id(v.getId()),
                followRepository.countByFollower_Id(v.getId()),
                following, v.getCreatedAt());
    }
}