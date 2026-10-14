package com.example.zenve_vet.feed.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "author_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private VetProfile author;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostType type;

    private String category;

    @Column(nullable = false, length = 2000)
    private String body;

    @Column(name = "media_url")
    private String mediaUrl;

    @Column(name = "consent_reviewed", nullable = false)
    private boolean consentReviewed = false;

    @Column(name = "view_count", nullable = false)
    private int viewCount = 0;

    @Column(name = "appreciation_count", nullable = false)
    private int appreciationCount = 0;

    @Column(name = "comment_count", nullable = false)
    private int commentCount = 0;

    @Column(name = "share_count", nullable = false)
    private int shareCount = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Post() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public VetProfile getAuthor() { return author; }
    public void setAuthor(VetProfile author) { this.author = author; }

    public PostType getType() { return type; }
    public void setType(PostType type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBody() { return body; }
    public void setBody(String body) { this.body = body; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public boolean isConsentReviewed() { return consentReviewed; }
    public void setConsentReviewed(boolean consentReviewed) { this.consentReviewed = consentReviewed; }

    public int getViewCount() { return viewCount; }
    public void setViewCount(int viewCount) { this.viewCount = viewCount; }

    public int getAppreciationCount() { return appreciationCount; }
    public void setAppreciationCount(int appreciationCount) { this.appreciationCount = appreciationCount; }

    public int getCommentCount() { return commentCount; }
    public void setCommentCount(int commentCount) { this.commentCount = commentCount; }

    public int getShareCount() { return shareCount; }
    public void setShareCount(int shareCount) { this.shareCount = shareCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}