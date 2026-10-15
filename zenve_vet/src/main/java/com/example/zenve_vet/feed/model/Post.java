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

    /**
     * The practical "what to take away" lines on a teaching case. Optional - the
     * search filter "Has takeaways" is exactly a test for this being present.
     */
    @Column(length = 1000)
    private String takeaways;

    /**
     * Coarse subject tag driving the search chips (Dermatology, Surgery, Livestock,
     * Equine, Imaging, Nutrition, Wildlife, Preventive). Kept separate from the
     * author's specialty: a dermatologist can post a nutrition case.
     */
    @Column(length = 60)
    private String topic;

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

    public String getTakeaways() { return takeaways; }
    public void setTakeaways(String takeaways) { this.takeaways = takeaways; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

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