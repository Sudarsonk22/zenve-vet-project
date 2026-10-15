package com.example.zenve_vet.seed;

import com.example.zenve_vet.feed.model.Appreciation;
import com.example.zenve_vet.feed.model.Comment;
import com.example.zenve_vet.feed.model.Post;
import com.example.zenve_vet.feed.model.PostType;
import com.example.zenve_vet.feed.repository.AppreciationRepository;
import com.example.zenve_vet.feed.repository.CommentRepository;
import com.example.zenve_vet.feed.repository.PostRepository;
import com.example.zenve_vet.messaging.model.Conversation;
import com.example.zenve_vet.messaging.model.ConversationState;
import com.example.zenve_vet.messaging.model.Message;
import com.example.zenve_vet.messaging.repository.ConversationRepository;
import com.example.zenve_vet.messaging.repository.ConversationStateRepository;
import com.example.zenve_vet.messaging.repository.MessageRepository;
import com.example.zenve_vet.shortvideo.model.ShortVideo;
import com.example.zenve_vet.shortvideo.model.VideoComment;
import com.example.zenve_vet.shortvideo.model.VideoLike;
import com.example.zenve_vet.shortvideo.repository.ShortVideoRepository;
import com.example.zenve_vet.shortvideo.repository.VideoCommentRepository;
import com.example.zenve_vet.shortvideo.repository.VideoLikeRepository;
import com.example.zenve_vet.vetnetwork.model.Clinic;
import com.example.zenve_vet.vetnetwork.model.Follow;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.ClinicRepository;
import com.example.zenve_vet.vetnetwork.repository.FollowRepository;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Loads the JSON files under {@code resources/seed} into the database on startup.
 *
 * <p>The data lives in JSON rather than in Java so it can be edited, reviewed in a
 * diff and extended without a recompile, and so the same files could be handed to
 * another environment.
 *
 * <p>Three rules it follows:
 * <ul>
 *   <li><b>It never overwrites.</b> If any vet profile already exists the whole run
 *       is skipped, so a database somebody has been working in is left alone.</li>
 *   <li><b>It is all or nothing.</b> One transaction - a malformed file leaves an
 *       empty database rather than half a feed.</li>
 *   <li><b>Counts are recomputed, not trusted.</b> {@code commentCount} and
 *       {@code appreciationCount} are set from the rows actually inserted, so the
 *       number on a post always matches what opening it will show.</li>
 * </ul>
 *
 * <p>Disable with {@code app.seed.enabled=false}.
 */
@Component
public class SeedLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SeedLoader.class);

    private final VetRepository vetRepository;
    private final ClinicRepository clinicRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final AppreciationRepository appreciationRepository;
    private final FollowRepository followRepository;
    private final ConversationRepository conversationRepository;
    private final ConversationStateRepository conversationStateRepository;
    private final MessageRepository messageRepository;
    private final ShortVideoRepository videoRepository;
    private final VideoLikeRepository videoLikeRepository;
    private final VideoCommentRepository videoCommentRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.seed.enabled:true}")
    private boolean enabled;

    public SeedLoader(
            VetRepository vetRepository,
            ClinicRepository clinicRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            AppreciationRepository appreciationRepository,
            FollowRepository followRepository,
            ConversationRepository conversationRepository,
            ConversationStateRepository conversationStateRepository,
            MessageRepository messageRepository,
            ShortVideoRepository videoRepository,
            VideoLikeRepository videoLikeRepository,
            VideoCommentRepository videoCommentRepository,
            ObjectMapper objectMapper
    ) {
        this.vetRepository = vetRepository;
        this.clinicRepository = clinicRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.appreciationRepository = appreciationRepository;
        this.followRepository = followRepository;
        this.conversationRepository = conversationRepository;
        this.conversationStateRepository = conversationStateRepository;
        this.messageRepository = messageRepository;
        this.videoRepository = videoRepository;
        this.videoLikeRepository = videoLikeRepository;
        this.videoCommentRepository = videoCommentRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            return;
        }
        if (vetRepository.count() > 0) {
            log.info("Seed skipped: vet_profiles already has {} row(s).", vetRepository.count());
            return;
        }

        LocalDateTime now = LocalDateTime.now();

        Map<String, VetProfile> vets = insertVets(now);
        int clinics = insertClinics(vets);
        Map<String, Post> posts = insertPosts(vets, now);
        int comments = insertComments(vets, posts, now);
        int appreciations = insertAppreciations(vets, posts, now);
        int follows = insertFollows(vets, now);
        int[] threads = insertConversations(vets, now);
        int videos = insertVideos(vets, now);

        // The counters on a post are denormalised, so they are written from the rows
        // that were actually inserted rather than from whatever the JSON claimed.
        postRepository.saveAll(posts.values());

        log.info("Seeded Zenve Vet from JSON: {} vets, {} clinics, {} posts, {} comments, "
                        + "{} appreciations, {} follows, {} conversations, {} messages, {} videos",
                vets.size(), clinics, posts.size(), comments, appreciations, follows,
                threads[0], threads[1], videos);
    }

    private Map<String, VetProfile> insertVets(LocalDateTime now) {
        Map<String, VetProfile> bySlug = new LinkedHashMap<>();

        for (SeedData.VetRow row : read("vet-profiles.json", new TypeReference<List<SeedData.VetRow>>() {})) {
            VetProfile vet = new VetProfile();
            vet.setSlug(row.slug());
            vet.setFullName(row.fullName());
            vet.setSpecialty(row.specialty());
            vet.setCity(row.city());
            vet.setState(row.state());
            vet.setBio(row.bio());
            vet.setAvatarUrl(row.avatarUrl());
            vet.setVerified(row.verified());
            vet.setCreatedAt(now.minusDays(row.daysAgo()));
            bySlug.put(row.slug(), vet);
        }

        vetRepository.saveAll(bySlug.values());
        return bySlug;
    }

    private int insertClinics(Map<String, VetProfile> vets) {
        List<Clinic> clinics = new ArrayList<>();

        for (SeedData.ClinicRow row : read("clinics.json", new TypeReference<List<SeedData.ClinicRow>>() {})) {
            VetProfile vet = require(vets, row.vetSlug(), "clinics.json", "vetSlug");
            Clinic clinic = new Clinic();
            clinic.setVet(vet);
            clinic.setName(row.name());
            clinic.setLocation(row.location());
            clinic.setAddress(row.address());
            clinic.setPhone(row.phone());
            clinic.setOpeningHours(row.openingHours());
            clinic.setServices(row.services());
            clinic.setAbout(row.about());
            clinic.setPhotoUrl(row.photoUrl());
            clinics.add(clinic);
        }

        clinicRepository.saveAll(clinics);
        return clinics.size();
    }

    private Map<String, Post> insertPosts(Map<String, VetProfile> vets, LocalDateTime now) {
        Map<String, Post> byRef = new LinkedHashMap<>();

        for (SeedData.PostRow row : read("posts.json", new TypeReference<List<SeedData.PostRow>>() {})) {
            VetProfile author = require(vets, row.authorSlug(), "posts.json", "authorSlug");

            Post post = new Post();
            post.setAuthor(author);
            post.setType(PostType.valueOf(row.type()));
            post.setCategory(row.category());
            post.setBody(row.body());
            post.setMediaUrl(row.mediaUrl());
            post.setConsentReviewed(row.consentReviewed());
            post.setTakeaways(row.takeaways());
            post.setTopic(row.topic());
            post.setViewCount(row.viewCount());
            post.setShareCount(row.shareCount());
            // Set from the inserted rows further down, not from the file.
            post.setCommentCount(0);
            post.setAppreciationCount(0);
            post.setCreatedAt(now.minusHours(row.hoursAgo()));

            byRef.put(row.ref(), post);
        }

        postRepository.saveAll(byRef.values());
        return byRef;
    }

    private int insertComments(Map<String, VetProfile> vets, Map<String, Post> posts, LocalDateTime now) {
        List<Comment> comments = new ArrayList<>();
        Map<String, Integer> tally = new HashMap<>();

        for (SeedData.CommentRow row : read("comments.json", new TypeReference<List<SeedData.CommentRow>>() {})) {
            Post post = require(posts, row.postRef(), "comments.json", "postRef");
            VetProfile author = require(vets, row.authorSlug(), "comments.json", "authorSlug");

            Comment comment = new Comment();
            comment.setPost(post);
            comment.setAuthor(author);
            comment.setBody(row.body());
            comment.setCreatedAt(now.minusHours(row.hoursAgo()));
            comments.add(comment);

            tally.merge(row.postRef(), 1, Integer::sum);
        }

        commentRepository.saveAll(comments);
        tally.forEach((ref, count) -> posts.get(ref).setCommentCount(count));
        return comments.size();
    }

    private int insertAppreciations(Map<String, VetProfile> vets, Map<String, Post> posts, LocalDateTime now) {
        List<Appreciation> appreciations = new ArrayList<>();

        for (SeedData.AppreciationRow row : read("appreciations.json", new TypeReference<List<SeedData.AppreciationRow>>() {})) {
            Post post = require(posts, row.postRef(), "appreciations.json", "postRef");

            for (String slug : row.vetSlugs()) {
                VetProfile vet = require(vets, slug, "appreciations.json", "vetSlugs");
                Appreciation appreciation = new Appreciation();
                appreciation.setPost(post);
                appreciation.setVet(vet);
                appreciation.setCreatedAt(now.minusHours(1));
                appreciations.add(appreciation);
            }

            post.setAppreciationCount(row.vetSlugs().size());
        }

        appreciationRepository.saveAll(appreciations);
        return appreciations.size();
    }

    private int insertFollows(Map<String, VetProfile> vets, LocalDateTime now) {
        List<Follow> follows = new ArrayList<>();

        for (SeedData.FollowRow row : read("follows.json", new TypeReference<List<SeedData.FollowRow>>() {})) {
            Follow follow = new Follow();
            follow.setFollower(require(vets, row.followerSlug(), "follows.json", "followerSlug"));
            follow.setFollowing(require(vets, row.followingSlug(), "follows.json", "followingSlug"));
            follow.setCreatedAt(now.minusDays(7));
            follows.add(follow);
        }

        followRepository.saveAll(follows);
        return follows.size();
    }

    /**
     * Seeds the direct-message threads.
     *
     * <p>Read position is set per person: a participant listed in {@code readUpToBy}
     * has read to the end, anyone else has unread messages waiting. That is what
     * gives the conversation list something to show in both states.
     *
     * @return {@code [conversations, messages]} inserted
     */
    private int[] insertConversations(Map<String, VetProfile> vets, LocalDateTime now) {
        int threads = 0;
        int sent = 0;

        for (SeedData.ConversationRow row : read("conversations.json",
                new TypeReference<List<SeedData.ConversationRow>>() {})) {

            if (row.participants() == null || row.participants().size() != 2) {
                throw new IllegalStateException(
                        "conversations.json: each thread needs exactly two participants.");
            }

            VetProfile a = require(vets, row.participants().get(0), "conversations.json", "participants");
            VetProfile b = require(vets, row.participants().get(1), "conversations.json", "participants");

            Conversation conversation = conversationRepository.save(new Conversation(a, b));
            conversation.setCreatedAt(now.minusDays(30));
            threads++;

            LocalDateTime latest = null;
            for (SeedData.MessageRow messageRow : row.messages()) {
                VetProfile sender = require(vets, messageRow.from(), "conversations.json", "from");
                if (!conversation.includes(sender.getId())) {
                    throw new IllegalStateException("conversations.json: \"" + messageRow.from()
                            + "\" is not a participant in that thread.");
                }

                Message message = new Message(conversation, sender, messageRow.content());
                message.setCreatedAt(now.minusHours(messageRow.hoursAgo()));
                messageRepository.save(message);
                sent++;

                if (latest == null || message.getCreatedAt().isAfter(latest)) {
                    latest = message.getCreatedAt();
                }
            }

            conversation.setLastMessageAt(latest == null ? conversation.getCreatedAt() : latest);
            conversationRepository.save(conversation);

            for (String slug : row.participants()) {
                VetProfile vet = vets.get(slug);
                ConversationState state = new ConversationState(conversation, vet);
                state.setPinned(contains(row.pinnedBy(), slug));
                state.setArchived(contains(row.archivedBy(), slug));
                if (contains(row.readUpToBy(), slug)) {
                    state.setLastReadAt(latest);
                }
                conversationStateRepository.save(state);
            }
        }
        return new int[]{threads, sent};
    }

    /**
     * Seeds the short videos, plus a spread of likes and comments so the counters
     * on a card are not all zero. Like counts are set from the rows inserted, never
     * invented, so the number under a video is the number of people who liked it.
     */
    private int insertVideos(Map<String, VetProfile> vets, LocalDateTime now) {
        List<VetProfile> roster = new ArrayList<>(vets.values());
        List<ShortVideo> videos = new ArrayList<>();
        int index = 0;

        for (SeedData.VideoRow row : read("videos.json", new TypeReference<List<SeedData.VideoRow>>() {})) {
            VetProfile creator = require(vets, row.creatorSlug(), "videos.json", "creatorSlug");

            ShortVideo video = new ShortVideo(creator, row.title(), row.videoUrl());
            video.setDescription(row.description());
            video.setThumbnailUrl(row.thumbnailUrl());
            video.setDurationSeconds(row.durationSeconds());
            video.setCategory(row.category());
            video.setSpecialty(row.specialty());
            video.setAnimalType(row.animalType());
            video.setCaseType(row.caseType());
            video.setHashtags(row.hashtags() == null ? List.of() : row.hashtags());
            video.setViewCount(row.viewCount());
            video.setShareCount(row.shareCount());
            video.setCreatedAt(now.minusHours(row.hoursAgo()));
            videos.add(videoRepository.save(video));

            // A deterministic slice of the roster likes each clip - enough variety
            // that sorting and the liked state are visibly doing something.
            int likes = 3 + (index * 7) % 14;
            int liked = 0;
            for (int i = 0; i < likes && i < roster.size(); i++) {
                VetProfile vet = roster.get((index * 5 + i * 3) % roster.size());
                if (vet.getId().equals(creator.getId())) {
                    continue;
                }
                videoLikeRepository.save(new VideoLike(video, vet));
                liked++;
            }
            video.setLikeCount(liked);

            int commentCount = index % 3;
            for (int i = 0; i < commentCount; i++) {
                VetProfile author = roster.get((index * 11 + i * 7) % roster.size());
                if (author.getId().equals(creator.getId())) {
                    continue;
                }
                VideoComment comment = new VideoComment(video, author, VIDEO_COMMENTS[(index + i) % VIDEO_COMMENTS.length]);
                comment.setCreatedAt(video.getCreatedAt().plusHours(i + 1L));
                videoCommentRepository.save(comment);
            }
            video.setCommentCount((int) videoCommentRepository.countByVideo_Id(video.getId()));
            videoRepository.save(video);

            index++;
        }
        return videos.size();
    }

    private static final String[] VIDEO_COMMENTS = {
            "Sharing this with our nursing team - the sequencing is the part people get wrong.",
            "Useful. I have been doing the second step out of order for years.",
            "Would you change anything for a very small patient?",
            "This is the clip I will show every new graduate.",
            "Good reminder. The slow version is always faster in the end.",
    };

    private boolean contains(List<String> list, String value) {
        return list != null && list.contains(value);
    }

    private <T> List<T> read(String fileName, TypeReference<List<T>> type) {
        ClassPathResource resource = new ClassPathResource("seed/" + fileName);
        try (InputStream in = resource.getInputStream()) {
            return objectMapper.readValue(in, type);
        } catch (IOException e) {
            throw new UncheckedIOException("Could not read seed file seed/" + fileName, e);
        }
    }

    /** A dangling slug is a typo in the data, so it fails loudly instead of silently dropping a row. */
    private <T> T require(Map<String, T> lookup, String key, String file, String field) {
        T value = lookup.get(key);
        if (value == null) {
            throw new IllegalStateException(
                    file + ": " + field + " \"" + key + "\" does not match anything seeded earlier.");
        }
        return value;
    }
}
