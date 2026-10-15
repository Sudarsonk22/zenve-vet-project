package com.example.zenve_vet.shortvideo.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** A comment under a video. */
@Entity
@Table(
        name = "short_video_comments",
        indexes = @Index(name = "idx_video_comment", columnList = "video_id, created_at")
)
public class VideoComment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private ShortVideo video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "author_id")
    private VetProfile author;

    @Column(nullable = false, length = 1000)
    private String content;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected VideoComment() {
    }

    public VideoComment(ShortVideo video, VetProfile author, String content) {
        this.video = video;
        this.author = author;
        this.content = content;
    }

    public Long getId() { return id; }
    public ShortVideo getVideo() { return video; }
    public VetProfile getAuthor() { return author; }
    public String getContent() { return content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
