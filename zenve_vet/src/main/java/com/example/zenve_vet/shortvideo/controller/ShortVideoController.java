package com.example.zenve_vet.shortvideo.controller;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.shortvideo.dto.*;
import com.example.zenve_vet.shortvideo.model.ShortVideo;
import com.example.zenve_vet.shortvideo.model.VideoVisibility;
import com.example.zenve_vet.shortvideo.service.ShortVideoService;
import com.example.zenve_vet.shortvideo.service.VideoStorage;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Short videos.
 *
 * <p>Paths follow {@code BACKEND_API_CONTRACT.md}. The caller is identified by
 * {@code viewerId}, which the frontend attaches to every request - this app has no
 * login, so there is no token to read a principal from.
 */
@RestController
@RequestMapping("/api/videos")
public class ShortVideoController {

    private final ShortVideoService videoService;
    private final VideoStorage storage;

    public ShortVideoController(ShortVideoService videoService, VideoStorage storage) {
        this.videoService = videoService;
        this.storage = storage;
    }

    @GetMapping
    public PageResponse<VideoResponse> list(
            @RequestParam(defaultValue = "forYou") String feed,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String animalType,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) String caseType,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return videoService.list(feed, category, animalType, specialty, state, caseType, q, viewerId, page, size);
    }

    /** Declared before {@code /{id}} so the literal path is not read as an id. */
    @GetMapping("/saved")
    public PageResponse<VideoResponse> saved(
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return videoService.saved(viewerId, page, size);
    }

    @GetMapping("/history")
    public PageResponse<VideoResponse> history(
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return videoService.history(viewerId, page, size);
    }

    @GetMapping("/categories")
    public List<String> categories() {
        return videoService.categories();
    }

    @GetMapping("/{id}")
    public VideoResponse get(@PathVariable Long id,
                             @RequestParam(required = false) Long viewerId) {
        return videoService.get(id, viewerId);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public VideoResponse upload(
            @RequestParam(required = false) Long viewerId,
            @RequestParam String title,
            @RequestParam(required = false) String description,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String animalType,
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String caseType,
            @RequestParam(defaultValue = "PUBLIC") String visibility,
            @RequestParam(required = false) List<String> hashtags,
            @RequestParam(required = false) Integer durationSeconds,
            @RequestParam("video") MultipartFile video,
            @RequestParam(required = false) MultipartFile thumbnail
    ) {
        if (title == null || title.isBlank()) {
            throw new BadRequestException("A title is required.");
        }

        ShortVideo saved = new ShortVideo(
                videoService.vet(viewerId), title.trim(), storage.storeVideo(video));

        saved.setDescription(description);
        saved.setCategory(blankToNull(category));
        saved.setAnimalType(blankToNull(animalType));
        saved.setSpecialty(blankToNull(specialty));
        saved.setCaseType(blankToNull(caseType));
        saved.setDurationSeconds(durationSeconds);
        saved.setVisibility(parseVisibility(visibility));
        saved.setHashtags(cleanTags(hashtags));

        if (thumbnail != null && !thumbnail.isEmpty()) {
            saved.setThumbnailUrl(storage.storeImage(thumbnail));
        }

        return videoService.create(saved);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        videoService.delete(id, viewerId);
    }

    @PostMapping("/{id}/like")
    public CountResponse like(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return videoService.setLiked(id, viewerId, true);
    }

    @DeleteMapping("/{id}/like")
    public CountResponse unlike(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return videoService.setLiked(id, viewerId, false);
    }

    @PostMapping("/{id}/save")
    public CountResponse save(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return videoService.setSaved(id, viewerId, true);
    }

    @DeleteMapping("/{id}/save")
    public CountResponse unsave(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return videoService.setSaved(id, viewerId, false);
    }

    @PostMapping("/{id}/share")
    public CountResponse share(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return videoService.recordShare(id, viewerId);
    }

    @PostMapping("/{id}/view")
    public void view(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        videoService.recordView(id, viewerId);
    }

    @GetMapping("/{id}/comments")
    public PageResponse<VideoCommentResponse> comments(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return videoService.comments(id, viewerId, page, size);
    }

    @PostMapping("/{id}/comments")
    public VideoCommentResponse comment(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId,
            @Valid @RequestBody VideoCommentRequest request
    ) {
        return videoService.comment(id, viewerId, request.content());
    }

    /** Serves an uploaded file. Seeded clips point straight at their own host. */
    @GetMapping("/files/**")
    public ResponseEntity<Resource> file(@RequestParam(required = false) String name,
                                         org.springframework.web.context.request.WebRequest request) {
        String path = request.getDescription(false).replaceFirst("^uri=/api/videos/files/", "");
        return storage.read(path)
                .map(found -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(found.contentType()))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline")
                        // Immutable once written - the name contains a UUID.
                        .header(HttpHeaders.CACHE_CONTROL, "public, max-age=31536000, immutable")
                        .body(found.resource()))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private VideoVisibility parseVisibility(String raw) {
        try {
            return VideoVisibility.valueOf(raw.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Unknown visibility: " + raw);
        }
    }

    /** Tags arrive with or without a hash and sometimes several to a field. */
    private List<String> cleanTags(List<String> raw) {
        List<String> tags = new ArrayList<>();
        if (raw == null) {
            return tags;
        }
        for (String entry : raw) {
            if (entry == null) {
                continue;
            }
            for (String part : entry.split("[\\s,]+")) {
                String tag = part.replaceAll("^#+", "").trim();
                if (!tag.isEmpty() && !tags.contains(tag)) {
                    tags.add(tag);
                }
            }
        }
        return tags;
    }
}
