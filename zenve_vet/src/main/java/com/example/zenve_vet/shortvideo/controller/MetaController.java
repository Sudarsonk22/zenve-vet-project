package com.example.zenve_vet.shortvideo.controller;

import com.example.zenve_vet.shortvideo.service.ShortVideoService;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import com.example.zenve_vet.vetnetwork.service.VetService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Reference lists for the upload form and the filter row.
 *
 * <p>Both are derived from what actually exists rather than hard-coded, so a
 * dropdown can never offer a value that returns nothing. Animal types come from
 * videos because that is the only place the concept is recorded; specialties come
 * from the vet roster, which is the fuller list.
 */
@RestController
@RequestMapping("/api")
public class MetaController {

    private final ShortVideoService videoService;
    private final VetRepository vetRepository;
    private final VetService vetService;

    public MetaController(ShortVideoService videoService, VetRepository vetRepository, VetService vetService) {
        this.videoService = videoService;
        this.vetRepository = vetRepository;
        this.vetService = vetService;
    }

    @GetMapping("/meta/specialties")
    public List<String> specialties() {
        return vetRepository.findSpecialties();
    }

    @GetMapping("/meta/animal-types")
    public List<String> animalTypes() {
        return videoService.animalTypes();
    }

    /**
     * Follow from the video player.
     *
     * <p>The vet network exposes the same action at {@code /vets/{id}/follow}; this
     * is the {@code /users/...} path the video and messaging modules were written
     * against. Both delegate to the one service method rather than each keeping
     * their own idea of what following means.
     */
    @PostMapping("/users/{id}/follow")
    public void follow(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        vetService.follow(id, viewerId);
    }

    @DeleteMapping("/users/{id}/follow")
    public void unfollow(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        vetService.unfollow(id, viewerId);
    }
}
