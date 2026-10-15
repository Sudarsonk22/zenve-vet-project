package com.example.zenve_vet.shortvideo.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/** A video kept for later; backs the Saved page. */
@Entity
@Table(
        name = "short_video_saves",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_video_save", columnNames = {"video_id", "vet_id"})
)
public class VideoSave {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "video_id")
    private ShortVideo video;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    private VetProfile vet;

    @Column(name = "saved_at", nullable = false, updatable = false)
    private LocalDateTime savedAt = LocalDateTime.now();

    protected VideoSave() {
    }

    public VideoSave(ShortVideo video, VetProfile vet) {
        this.video = video;
        this.vet = vet;
    }

    public Long getId() { return id; }
    public ShortVideo getVideo() { return video; }
    public VetProfile getVet() { return vet; }
    public LocalDateTime getSavedAt() { return savedAt; }
}
