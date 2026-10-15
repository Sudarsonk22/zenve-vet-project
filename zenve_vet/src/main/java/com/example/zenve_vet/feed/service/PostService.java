package com.example.zenve_vet.feed.service;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.NotFoundException;
import com.example.zenve_vet.feed.dto.AuthorSummary;
import com.example.zenve_vet.feed.dto.CommentRequest;
import com.example.zenve_vet.feed.dto.CommentResponse;
import com.example.zenve_vet.feed.dto.PostRequest;
import com.example.zenve_vet.feed.dto.PostResponse;
import com.example.zenve_vet.feed.dto.ReactionResponse;
import com.example.zenve_vet.feed.dto.SaveResponse;
import com.example.zenve_vet.feed.dto.ShareResponse;
import com.example.zenve_vet.feed.dto.StoryResponse;
import com.example.zenve_vet.feed.model.Appreciation;
import com.example.zenve_vet.feed.model.Comment;
import com.example.zenve_vet.feed.model.Post;
import com.example.zenve_vet.feed.model.PostType;
import com.example.zenve_vet.feed.model.SavedPost;
import com.example.zenve_vet.feed.repository.AppreciationRepository;
import com.example.zenve_vet.feed.repository.CommentRepository;
import com.example.zenve_vet.feed.repository.PostRepository;
import com.example.zenve_vet.feed.repository.SavedPostRepository;
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

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class PostService {

    private final PostRepository postRepository;
    private final AppreciationRepository appreciationRepository;
    private final CommentRepository commentRepository;
    private final SavedPostRepository savedPostRepository;
    private final VetRepository vetRepository;
    private final FollowRepository followRepository;

    public PostService(PostRepository postRepository,
                       AppreciationRepository appreciationRepository,
                       CommentRepository commentRepository,
                       SavedPostRepository savedPostRepository,
                       VetRepository vetRepository,
                       FollowRepository followRepository) {
        this.postRepository = postRepository;
        this.appreciationRepository = appreciationRepository;
        this.commentRepository = commentRepository;
        this.savedPostRepository = savedPostRepository;
        this.vetRepository = vetRepository;
        this.followRepository = followRepository;
    }

    public PageResponse<PostResponse> list(String tab, String specialty, String state, String city,
                                           PostType type, Long authorId, Long viewerId,
                                           int page, int size) {
        if (!tab.equals("for-you") && !tab.equals("popular") && !tab.equals("following")) {
            throw new BadRequestException("tab must be for-you, popular or following");
        }

        List<Long> followingIds = null;
        if (tab.equals("following")) {
            if (viewerId == null) {
                throw new BadRequestException("viewerId is required for the following tab");
            }
            followingIds = followRepository.findByFollower_Id(viewerId).stream()
                    .map(f -> f.getFollowing().getId())
                    .toList();
            if (followingIds.isEmpty()) {
                return new PageResponse<>(List.of(), page, size, 0, 0);
            }
        }

        List<Long> ids = followingIds;
        Specification<Post> spec = (root, query, cb) -> {
            Join<Post, VetProfile> author = root.join("author");
            List<Predicate> list = new ArrayList<>();
            if (!specialty.isBlank()) {
                list.add(cb.equal(author.get("specialty"), specialty));
            }
            if (!state.isBlank()) {
                list.add(cb.equal(author.get("state"), state));
            }
            if (!city.isBlank()) {
                list.add(cb.equal(author.get("city"), city));
            }
            if (type != null) {
                list.add(cb.equal(root.get("type"), type));
            }
            if (authorId != null) {
                list.add(cb.equal(author.get("id"), authorId));
            }
            if (ids != null) {
                list.add(author.get("id").in(ids));
            }
            return cb.and(list.toArray(new Predicate[0]));
        };

        Sort sort = tab.equals("popular")
                ? Sort.by(Sort.Order.desc("appreciationCount"), Sort.Order.desc("createdAt"))
                : Sort.by(Sort.Order.desc("createdAt"));

        Page<Post> result = postRepository.findAll(spec, PageRequest.of(page, size, sort));
        List<PostResponse> items = result.getContent().stream()
                .map(p -> toResponse(p, viewerId))
                .toList();

        return new PageResponse<>(items, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    public PostResponse get(Long id, Long viewerId) {
        return toResponse(findPost(id), viewerId);
    }

    public PostResponse create(PostRequest request) {
        VetProfile author = vetRepository.findById(request.authorId())
                .orElseThrow(() -> new NotFoundException("Vet not found"));

        if (request.type() == PostType.CLINICAL_CASE && !Boolean.TRUE.equals(request.consentReviewed())) {
            throw new BadRequestException("Confirm that consent was reviewed and the case is de-identified");
        }
        if (request.type() == PostType.SHORT_VIDEO
                && (request.mediaUrl() == null || request.mediaUrl().isBlank())) {
            throw new BadRequestException("A short video needs a mediaUrl");
        }

        Post post = new Post();
        post.setAuthor(author);
        post.setType(request.type());
        post.setCategory(request.category());
        post.setBody(request.body());
        post.setMediaUrl(request.mediaUrl());
        post.setConsentReviewed(Boolean.TRUE.equals(request.consentReviewed()));
        post.setTakeaways(request.takeaways());
        post.setTopic(request.topic());

        return toResponse(postRepository.save(post), request.authorId());
    }

    public void delete(Long id) {
        postRepository.delete(findPost(id));
    }

    public void addView(Long id) {
        Post post = findPost(id);
        post.setViewCount(post.getViewCount() + 1);
        postRepository.save(post);
    }

    public ReactionResponse appreciate(Long id, Long vetId) {
        Post post = findPost(id);
        VetProfile vet = vetRepository.findById(vetId)
                .orElseThrow(() -> new NotFoundException("Vet not found"));

        if (!appreciationRepository.existsByPost_IdAndVet_Id(id, vetId)) {
            Appreciation appreciation = new Appreciation();
            appreciation.setPost(post);
            appreciation.setVet(vet);
            appreciationRepository.save(appreciation);

            post.setAppreciationCount(post.getAppreciationCount() + 1);
            postRepository.save(post);
        }
        return new ReactionResponse(true, post.getAppreciationCount());
    }

    public ReactionResponse removeAppreciation(Long id, Long vetId) {
        Post post = findPost(id);

        appreciationRepository.findByPost_IdAndVet_Id(id, vetId).ifPresent(a -> {
            appreciationRepository.delete(a);
            post.setAppreciationCount(Math.max(0, post.getAppreciationCount() - 1));
            postRepository.save(post);
        });
        return new ReactionResponse(false, post.getAppreciationCount());
    }

    public List<CommentResponse> comments(Long id) {
        findPost(id);
        return commentRepository.findByPost_IdOrderByCreatedAtAsc(id).stream()
                .map(c -> new CommentResponse(c.getId(), c.getBody(), toAuthor(c.getAuthor()), c.getCreatedAt()))
                .toList();
    }

    public CommentResponse addComment(Long id, CommentRequest request) {
        Post post = findPost(id);
        VetProfile author = vetRepository.findById(request.authorId())
                .orElseThrow(() -> new NotFoundException("Vet not found"));

        Comment comment = new Comment();
        comment.setPost(post);
        comment.setAuthor(author);
        comment.setBody(request.body());
        Comment saved = commentRepository.save(comment);

        post.setCommentCount(post.getCommentCount() + 1);
        postRepository.save(post);

        return new CommentResponse(saved.getId(), saved.getBody(), toAuthor(author), saved.getCreatedAt());
    }

    public ShareResponse share(Long id) {
        Post post = findPost(id);
        post.setShareCount(post.getShareCount() + 1);
        postRepository.save(post);
        return new ShareResponse(post.getShareCount());
    }

    public SaveResponse save(Long id, Long vetId) {
        Post post = findPost(id);
        VetProfile vet = vetRepository.findById(vetId)
                .orElseThrow(() -> new NotFoundException("Vet not found"));

        if (!savedPostRepository.existsByPost_IdAndVet_Id(id, vetId)) {
            SavedPost savedPost = new SavedPost();
            savedPost.setPost(post);
            savedPost.setVet(vet);
            savedPostRepository.save(savedPost);
        }
        return new SaveResponse(true);
    }

    public SaveResponse unsave(Long id, Long vetId) {
        findPost(id);
        savedPostRepository.findByPost_IdAndVet_Id(id, vetId).ifPresent(savedPostRepository::delete);
        return new SaveResponse(false);
    }

    public PageResponse<PostResponse> savedPosts(Long vetId, int page, int size) {
        if (!vetRepository.existsById(vetId)) {
            throw new NotFoundException("Vet not found");
        }

        Page<SavedPost> result = savedPostRepository
                .findByVet_IdOrderBySavedAtDesc(vetId, PageRequest.of(page, size));
        List<PostResponse> items = result.getContent().stream()
                .map(s -> toResponse(s.getPost(), vetId))
                .toList();

        return new PageResponse<>(items, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    public List<StoryResponse> stories() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<Post> posts = postRepository.findByTypeAndCreatedAtAfterOrderByCreatedAtDesc(PostType.STORY, since);

        Map<Long, List<Post>> byAuthor = posts.stream()
                .collect(Collectors.groupingBy(p -> p.getAuthor().getId(), LinkedHashMap::new, Collectors.toList()));

        return byAuthor.values().stream()
                .map(list -> new StoryResponse(toAuthor(list.get(0).getAuthor()), list.size(), list.get(0).getCreatedAt()))
                .toList();
    }

    private Post findPost(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Post not found"));
    }

    private AuthorSummary toAuthor(VetProfile vet) {
        return new AuthorSummary(vet.getId(), vet.getSlug(), vet.getFullName(),
                vet.getSpecialty(), vet.getCity(), vet.getState(), vet.getAvatarUrl());
    }

    // ------------------------------------------------------------------ search

    /**
     * Free-text search across posts, used by the Search page.
     *
     * <p>Separate from {@link #list} because the feed and the search page ask
     * different questions: the feed filters by who you follow and whose specialty a
     * post's author holds, while search matches words in the body and a topic tag
     * that belongs to the post itself.
     */
    @Transactional(readOnly = true)
    public PageResponse<PostResponse> searchPosts(String q, String topic, String state,
                                                  boolean hasTakeaways, List<PostType> types,
                                                  Long viewerId, int page, int size) {
        if (page < 0) {
            throw new BadRequestException("Page cannot be negative");
        }
        if (size < 1 || size > 50) {
            throw new BadRequestException("Page size must be between 1 and 50");
        }

        Specification<Post> spec = withTypes(searchSpec(q, topic, state, hasTakeaways), types);
        Page<Post> result = postRepository.findAll(spec,
                PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt"))));

        List<PostResponse> items = result.getContent().stream()
                .map(post -> toResponse(post, viewerId))
                .toList();

        return new PageResponse<>(items, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    /** How many posts the same filters match, optionally narrowed to certain types. */
    @Transactional(readOnly = true)
    public long countPosts(String q, String topic, String state, boolean hasTakeaways,
                           List<PostType> types) {
        return postRepository.count(withTypes(searchSpec(q, topic, state, hasTakeaways), types));
    }

    /** Narrows a spec to a set of post types; an empty or null set means every type. */
    private Specification<Post> withTypes(Specification<Post> spec, List<PostType> types) {
        if (types == null || types.isEmpty()) {
            return spec;
        }
        return (root, query, cb) -> cb.and(
                spec.toPredicate(root, query, cb),
                root.get("type").in(types));
    }

    private Specification<Post> searchSpec(String q, String topic, String state,
                                           boolean hasTakeaways) {
        String needle = q == null ? "" : q.trim().toLowerCase();
        String wantedTopic = topic == null ? "" : topic.trim();
        String wantedState = state == null ? "" : state.trim();

        return (root, query, cb) -> {
            Join<Post, VetProfile> author = root.join("author");
            List<Predicate> list = new ArrayList<>();

            if (!needle.isEmpty()) {
                String like = "%" + needle + "%";
                // The author's name and specialty count as a match: searching
                // "dermatology" should surface a dermatologist's posts, not just
                // posts with the word in the body.
                list.add(cb.or(
                        cb.like(cb.lower(root.get("body")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("takeaways"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("topic"), "")), like),
                        cb.like(cb.lower(cb.coalesce(root.get("category"), "")), like),
                        cb.like(cb.lower(author.get("fullName")), like),
                        cb.like(cb.lower(author.get("specialty")), like)));
            }
            if (!wantedTopic.isEmpty()) {
                list.add(cb.equal(root.get("topic"), wantedTopic));
            }
            if (!wantedState.isEmpty()) {
                list.add(cb.equal(author.get("state"), wantedState));
            }
            if (hasTakeaways) {
                list.add(cb.and(
                        cb.isNotNull(root.get("takeaways")),
                        cb.notEqual(cb.trim(root.get("takeaways")), "")));
            }
            return list.isEmpty() ? cb.conjunction() : cb.and(list.toArray(new Predicate[0]));
        };
    }

    private PostResponse toResponse(Post post, Long viewerId) {
        boolean appreciated = viewerId != null
                && appreciationRepository.existsByPost_IdAndVet_Id(post.getId(), viewerId);
        boolean saved = viewerId != null
                && savedPostRepository.existsByPost_IdAndVet_Id(post.getId(), viewerId);

        return new PostResponse(post.getId(), post.getType(), post.getCategory(), post.getBody(),
                post.getMediaUrl(), post.isConsentReviewed(), post.getTakeaways(), post.getTopic(),
                toAuthor(post.getAuthor()),
                post.getViewCount(), post.getAppreciationCount(), post.getCommentCount(),
                post.getShareCount(), appreciated, saved, post.getCreatedAt());
    }
}