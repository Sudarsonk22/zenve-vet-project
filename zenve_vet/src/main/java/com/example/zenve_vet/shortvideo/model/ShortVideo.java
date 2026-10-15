package com.example.zenve_vet.shortvideo.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * A short teaching clip.
 *
 * <p>{@code videoUrl} holds either an absolute URL (for seeded clips hosted
 * elsewhere) or a path this API serves (for uploads). The frontend resolves both
 * the same way, so nothing downstream has to care which it is.
 *
 * <p>The counters are denormalised. Like and save are also stored as rows, because
 * the UI needs to know whether <em>you</em> liked something, not just how many did;
 * the counter is kept in step with those rows in one transaction.
 */
@Entity
@Table(
        name = "short_videos",
        indexes = {
                @Index(name = "idx_video_creator", columnList = "creator_id"),
                @Index(name = "idx_video_created", columnList = "created_at")
        }
)
public class ShortVideo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "creator_id")
    private VetProfile creator;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(name = "video_url", nullable = false, length = 500)
    private String videoUrl;

    @Column(name = "thumbnail_url", length = 500)
    private String thumbnailUrl;

    @Column(name = "duration_seconds")
    private Integer durationSeconds;

    @Column(length = 80)
    private String category;

    @Column(length = 80)
    private String specialty;

    @Column(name = "animal_type", length = 60)
    private String animalType;

    /** Clinical cases / Clinical perspectives / Procedures - the filter above the grid. */
    @Column(name = "case_type", length = 60)
    private String caseType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VideoVisibility visibility = VideoVisibility.PUBLIC;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "short_video_hashtags", joinColumns = @JoinColumn(name = "video_id"))
    @Column(name = "hashtag", length = 60)
    private List<String> hashtags = new ArrayList<>();

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Column(name = "like_count", nullable = false)
    private int likeCount = 0;

    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;

    @Column(name = "share_count", nullable = false)
    private int shareCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected ShortVideo() {
    }

    public ShortVideo(VetProfile creator, String title, String videoUrl) {
        this.creator = creator;
        this.title = title;
        this.videoUrl = videoUrl;
    }

    public Long getId() { return id; }
    public VetProfile getCreator() { return creator; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getVideoUrl() { return videoUrl; }
    public void setVideoUrl(String videoUrl) { this.videoUrl = videoUrl; }
    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }
    public Integer getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(Integer durationSeconds) { this.durationSeconds = durationSeconds; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public String getSpecialty() { return specialty; }
    public void setSpecialty(String specialty) { this.specialty = specialty; }
    public String getAnimalType() { return animalType; }
    public void setAnimalType(String animalType) { this.animalType = animalType; }
    public String getCaseType() { return caseType; }
    public void setCaseType(String caseType) { this.caseType = caseType; }
    public VideoVisibility getVisibility() { return visibility; }
    public void setVisibility(VideoVisibility visibility) { this.visibility = visibility; }
    public List<String> getHashtags() { return hashtags; }
    public void setHashtags(List<String> hashtags) { this.hashtags = hashtags; }
    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }
    public int getLikeCount() { return likeCount; }
    public void setLikeCount(int likeCount) { this.likeCount = likeCount; }
    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }
    public int getShareCount() { return shareCount; }
    public void setShareCount(int shareCount) { this.shareCount = shareCount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
