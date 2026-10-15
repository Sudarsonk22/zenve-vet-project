package com.example.zenve_vet.shortvideo.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * One watch, by one person.
 *
 * <p>Unique per viewer rather than per play: the Watch history page wants "videos I
 * have seen", each appearing once, most recent first. Re-watching moves the row up
 * instead of adding another. The public view counter is separate and does count
 * every play.
 */
@Entity
@Table(
        name = "short_video_views",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_video_view", columnNames = {"video_id", "vet_id"})
)
public class VideoView {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private ShortVideo video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    private VetProfile vet;

    @Column(name = "watched_at", nullable = false)
    private LocalDateTime watchedAt = LocalDateTime.now();

    protected VideoView() {
    }

    public VideoView(ShortVideo video, VetProfile vet) {
        this.video = video;
        this.vet = vet;
    }

    public Long getId() { return id; }
    public ShortVideo getVideo() { return video; }
    public VetProfile getVet() { return vet; }
    public LocalDateTime getWatchedAt() { return watchedAt; }
    public void setWatchedAt(LocalDateTime watchedAt) { this.watchedAt = watchedAt; }
}
