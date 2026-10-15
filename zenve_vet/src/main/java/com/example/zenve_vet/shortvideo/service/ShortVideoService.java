package com.example.zenve_vet.shortvideo.service;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.NotFoundException;
import com.example.zenve_vet.shortvideo.dto.*;
import com.example.zenve_vet.shortvideo.model.*;
import com.example.zenve_vet.shortvideo.repository.*;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.FollowRepository;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Short teaching clips - the feed, the player and everything a viewer can do to one.
 *
 * <p>As elsewhere in this backend the caller is identified by {@code viewerId}
 * rather than a token; see {@code MessagingService} for what that does and does not
 * guarantee. Ownership checks route through {@link #requireOwner} so there is one
 * place to harden later.
 */
@Service
public class ShortVideoService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ShortVideoRepository videoRepository;
    private final VideoLikeRepository likeRepository;
    private final VideoSaveRepository saveRepository;
    private final VideoCommentRepository commentRepository;
    private final VideoViewRepository viewRepository;
    private final VetRepository vetRepository;
    private final FollowRepository followRepository;

    public ShortVideoService(
            ShortVideoRepository videoRepository,
            VideoLikeRepository likeRepository,
            VideoSaveRepository saveRepository,
            VideoCommentRepository commentRepository,
            VideoViewRepository viewRepository,
            VetRepository vetRepository,
            FollowRepository followRepository
    ) {
        this.videoRepository = videoRepository;
        this.likeRepository = likeRepository;
        this.saveRepository = saveRepository;
        this.commentRepository = commentRepository;
        this.viewRepository = viewRepository;
        this.vetRepository = vetRepository;
        this.followRepository = followRepository;
    }

    // ------------------------------------------------------------------ feeds

    @Transactional(readOnly = true)
    public PageResponse<VideoResponse> list(String feed, String category, String animalType,
                                            String specialty, String state, String caseType,
                                            String q, Long viewerId, int page, int size) {
        int safeSize = clamp(size);

        List<Long> followingIds = null;
        if ("following".equalsIgnoreCase(feed) && viewerId != null) {
            followingIds = followRepository.findByFollower_Id(viewerId).stream()
                    .map(follow -> follow.getFollowing().getId())
                    .toList();
            // Following nobody means an empty feed, not everybody. An empty "in"
            // clause would otherwise be dropped and silently show the whole site.
            if (followingIds.isEmpty()) {
                return new PageResponse<>(List.of(), page, safeSize, 0, 0);
            }
        }

        Specification<ShortVideo> spec = spec(
                category, animalType, specialty, state, caseType, q, followingIds, viewerId);

        Page<ShortVideo> result = videoRepository.findAll(spec,
                PageRequest.of(Math.max(page, 0), safeSize, Sort.by(Sort.Order.desc("createdAt"))));

        return new PageResponse<>(toResponses(result.getContent(), viewerId),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PageResponse<VideoResponse> saved(Long viewerId, int page, int size) {
        requireVet(viewerId);
        int safeSize = clamp(size);

        Page<VideoSave> result = saveRepository.findByVet_IdOrderBySavedAtDesc(
                viewerId, PageRequest.of(Math.max(page, 0), safeSize));

        List<ShortVideo> videos = result.getContent().stream().map(VideoSave::getVideo).toList();
        return new PageResponse<>(toResponses(videos, viewerId),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public PageResponse<VideoResponse> history(Long viewerId, int page, int size) {
        requireVet(viewerId);
        int safeSize = clamp(size);

        Page<VideoView> result = viewRepository.findByVet_IdOrderByWatchedAtDesc(
                viewerId, PageRequest.of(Math.max(page, 0), safeSize));

        List<ShortVideo> videos = result.getContent().stream().map(VideoView::getVideo).toList();
        return new PageResponse<>(toResponses(videos, viewerId),
                result.getNumber(), result.getSize(), result.getTotalElements(), result.getTotalPages());
    }

    @Transactional(readOnly = true)
    public VideoResponse get(Long id, Long viewerId) {
        ShortVideo video = requireVideo(id);
        requireVisible(video, viewerId);
        return toResponses(List.of(video), viewerId).get(0);
    }

    // --------------------------------------------------------------- mutation

    @Transactional
    public VideoResponse create(ShortVideo video) {
        return toResponses(List.of(videoRepository.save(video)), video.getCreator().getId()).get(0);
    }

    @Transactional
    public void delete(Long id, Long viewerId) {
        ShortVideo video = requireOwner(id, viewerId);

        // Children first - the rows point at the video, not the other way round.
        commentRepository.deleteByVideo_Id(video.getId());
        likeRepository.deleteByVideo_Id(video.getId());
        saveRepository.deleteByVideo_Id(video.getId());
        viewRepository.deleteByVideo_Id(video.getId());
        videoRepository.delete(video);
    }

    @Transactional
    public CountResponse setLiked(Long id, Long viewerId, boolean liked) {
        ShortVideo video = requireVideo(id);
        requireVisible(video, viewerId);
        VetProfile vet = requireVet(viewerId);

        Optional<VideoLike> existing = likeRepository.findByVideo_IdAndVet_Id(id, viewerId);

        // Both directions are idempotent: liking twice, or unliking what was never
        // liked, leaves the counter where it was.
        if (liked && existing.isEmpty()) {
            likeRepository.save(new VideoLike(video, vet));
            video.setLikeCount(video.getLikeCount() + 1);
        } else if (!liked && existing.isPresent()) {
            likeRepository.delete(existing.get());
            video.setLikeCount(Math.max(0, video.getLikeCount() - 1));
        }
        videoRepository.save(video);

        return new CountResponse(video.getLikeCount(), video.getShareCount(), liked,
                saveRepository.findByVideo_IdAndVet_Id(id, viewerId).isPresent());
    }

    @Transactional
    public CountResponse setSaved(Long id, Long viewerId, boolean saved) {
        ShortVideo video = requireVideo(id);
        requireVisible(video, viewerId);
        VetProfile vet = requireVet(viewerId);

        Optional<VideoSave> existing = saveRepository.findByVideo_IdAndVet_Id(id, viewerId);
        if (saved && existing.isEmpty()) {
            saveRepository.save(new VideoSave(video, vet));
        } else if (!saved && existing.isPresent()) {
            saveRepository.delete(existing.get());
        }

        return new CountResponse(video.getLikeCount(), video.getShareCount(),
                likeRepository.findByVideo_IdAndVet_Id(id, viewerId).isPresent(), saved);
    }

    @Transactional
    public CountResponse recordShare(Long id, Long viewerId) {
        ShortVideo video = requireVideo(id);
        requireVisible(video, viewerId);
        video.setShareCount(video.getShareCount() + 1);
        videoRepository.save(video);
        return new CountResponse(video.getLikeCount(), video.getShareCount(), false, false);
    }

    /**
     * Records a play. The public counter rises every time; the viewer's history row
     * is moved rather than duplicated, so re-watching does not fill the page with
     * the same clip.
     */
    @Transactional
    public void recordView(Long id, Long viewerId) {
        ShortVideo video = requireVideo(id);
        requireVisible(video, viewerId);

        video.setViewCount(video.getViewCount() + 1);
        videoRepository.save(video);

        if (viewerId == null) {
            return;
        }
        VideoView view = viewRepository.findByVideo_IdAndVet_Id(id, viewerId)
                .orElseGet(() -> new VideoView(video, requireVet(viewerId)));
        view.setWatchedAt(java.time.LocalDateTime.now());
        viewRepository.save(view);
    }

    // --------------------------------------------------------------- comments

    @Transactional(readOnly = true)
    public PageResponse<VideoCommentResponse> comments(Long videoId, Long viewerId, int page, int size) {
        ShortVideo video = requireVideo(videoId);
        requireVisible(video, viewerId);

        Page<VideoComment> result = commentRepository.findByVideo_IdOrderByCreatedAtDesc(
                videoId, PageRequest.of(Math.max(page, 0), clamp(size)));

        List<VideoCommentResponse> items = result.getContent().stream()
                .map(comment -> new VideoCommentResponse(
                        comment.getId(), comment.getContent(), comment.getCreatedAt(),
                        toCreator(comment.getAuthor(), viewerId)))
                .toList();

        return new PageResponse<>(items, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public VideoCommentResponse comment(Long videoId, Long viewerId, String content) {
        ShortVideo video = requireVideo(videoId);
        requireVisible(video, viewerId);
        VetProfile author = requireVet(viewerId);

        VideoComment comment = commentRepository.save(new VideoComment(video, author, content.trim()));

        // Recounted from the rows rather than incremented, so the number on the card
        // always matches what opening the thread shows.
        video.setCommentCount((int) commentRepository.countByVideo_Id(videoId));
        videoRepository.save(video);

        return new VideoCommentResponse(comment.getId(), comment.getContent(),
                comment.getCreatedAt(), toCreator(author, viewerId));
    }

    // ------------------------------------------------------------------- meta

    @Transactional(readOnly = true)
    public List<String> categories() {
        return videoRepository.findCategories();
    }

    @Transactional(readOnly = true)
    public List<String> animalTypes() {
        return videoRepository.findAnimalTypes();
    }

    @Transactional(readOnly = true)
    public VetProfile vet(Long id) {
        return requireVet(id);
    }

    // ------------------------------------------------------------ guard rails

    private ShortVideo requireVideo(Long id) {
        return videoRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Video not found: " + id));
    }

    private VetProfile requireVet(Long id) {
        if (id == null) {
            throw new BadRequestException("A viewer id is required.");
        }
        return vetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vet not found: " + id));
    }

    public ShortVideo requireOwner(Long videoId, Long viewerId) {
        ShortVideo video = requireVideo(videoId);
        if (viewerId == null || !video.getCreator().getId().equals(viewerId)) {
            throw new NotFoundException("Video not found: " + videoId);
        }
        return video;
    }

    /**
     * A private video is visible only to its creator, and a followers-only video
     * only to people who follow them. Fails as "not found" rather than "forbidden":
     * confirming that a hidden video exists is itself a leak.
     */
    private void requireVisible(ShortVideo video, Long viewerId) {
        if (video.getVisibility() == VideoVisibility.PUBLIC) {
            return;
        }
        if (viewerId != null && video.getCreator().getId().equals(viewerId)) {
            return;
        }
        if (video.getVisibility() == VideoVisibility.FOLLOWERS
                && viewerId != null
                && followRepository.existsByFollower_IdAndFollowing_Id(viewerId, video.getCreator().getId())) {
            return;
        }
        throw new NotFoundException("Video not found: " + video.getId());
    }

    // ------------------------------------------------------------------ query

    private Specification<ShortVideo> spec(String category, String animalType, String specialty,
                                           String state, String caseType, String q,
                                           List<Long> followingIds, Long viewerId) {
        String needle = q == null ? "" : q.trim().toLowerCase();

        return (root, query, cb) -> {
            Join<ShortVideo, VetProfile> creator = root.join("creator");
            List<Predicate> list = new ArrayList<>();

            addEquals(list, cb, root.get("category"), category);
            addEquals(list, cb, root.get("animalType"), animalType);
            addEquals(list, cb, root.get("specialty"), specialty);
            addEquals(list, cb, root.get("caseType"), caseType);
            addEquals(list, cb, creator.get("state"), state);

            if (!needle.isEmpty()) {
                String like = "%" + needle + "%";
                list.add(cb.or(
                        cb.like(cb.lower(root.get("title")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("description"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("category"), "")), like),
                        cb.like(cb.lower(creator.get("fullName")), like)));
            }
            if (followingIds != null) {
                list.add(creator.get("id").in(followingIds));
            }

            // Hidden videos stay out of every listing, except for their own creator.
            Predicate isPublic = cb.equal(root.get("visibility"), VideoVisibility.PUBLIC);
            list.add(viewerId == null
                    ? isPublic
                    : cb.or(isPublic, cb.equal(creator.get("id"), viewerId)));

            return cb.and(list.toArray(new Predicate[0]));
        };
    }

    private void addEquals(List<Predicate> list, jakarta.persistence.criteria.CriteriaBuilder cb,
                           jakarta.persistence.criteria.Path<?> path, String value) {
        if (value != null && !value.isBlank()) {
            list.add(cb.equal(path, value.trim()));
        }
    }

    // ------------------------------------------------------------- projection

    /**
     * Maps a page of videos in three queries rather than three per row: the liked
     * and saved sets for the whole page are fetched once and looked up in memory.
     */
    private List<VideoResponse> toResponses(List<ShortVideo> videos, Long viewerId) {
        if (videos.isEmpty()) {
            return List.of();
        }
        List<Long> ids = videos.stream().map(ShortVideo::getId).toList();

        Set<Long> liked = viewerId == null ? Set.of()
                : new HashSet<>(likeRepository.findLikedVideoIds(viewerId, ids));
        Set<Long> saved = viewerId == null ? Set.of()
                : new HashSet<>(saveRepository.findSavedVideoIds(viewerId, ids));

        return videos.stream()
                .map(video -> new VideoResponse(
                        video.getId(),
                        video.getTitle(),
                        video.getDescription(),
                        video.getVideoUrl(),
                        video.getThumbnailUrl(),
                        video.getDurationSeconds(),
                        video.getCategory(),
                        video.getSpecialty(),
                        video.getAnimalType(),
                        video.getCaseType(),
                        video.getVisibility().name(),
                        List.copyOf(video.getHashtags()),
                        video.getViewCount(),
                        video.getLikeCount(),
                        video.getCommentCount(),
                        video.getShareCount(),
                        liked.contains(video.getId()),
                        saved.contains(video.getId()),
                        viewerId != null && video.getCreator().getId().equals(viewerId),
                        toCreator(video.getCreator(), viewerId),
                        video.getCreatedAt()))
                .toList();
    }

    private VideoCreator toCreator(VetProfile vet, Long viewerId) {
        String location = vet.getState() == null || vet.getState().isBlank()
                ? vet.getCity()
                : vet.getCity() + ", " + vet.getState();

        boolean following = viewerId != null
                && !vet.getId().equals(viewerId)
                && followRepository.existsByFollower_IdAndFollowing_Id(viewerId, vet.getId());

        return new VideoCreator(vet.getId(), vet.getFullName(), vet.getAvatarUrl(),
                vet.getSpecialty(), location, following);
    }

    private int clamp(int size) {
        return size < 1 ? 10 : Math.min(size, MAX_PAGE_SIZE);
    }
}
