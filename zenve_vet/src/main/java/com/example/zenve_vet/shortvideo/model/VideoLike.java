package com.example.zenve_vet.shortvideo.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** One like. The unique constraint is what keeps the counter honest. */
@Entity
@Table(
        name = "short_video_likes",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_video_like", columnNames = {"video_id", "vet_id"})
)
public class VideoLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private ShortVideo video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    private VetProfile vet;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected VideoLike() {
    }

    public VideoLike(ShortVideo video, VetProfile vet) {
        this.video = video;
        this.vet = vet;
    }

    public Long getId() { return id; }
    public ShortVideo getVideo() { return video; }
    public VetProfile getVet() { return vet; }
}
