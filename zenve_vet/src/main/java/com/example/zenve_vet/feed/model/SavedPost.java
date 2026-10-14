package com.example.zenve_vet.feed.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "saved_posts",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "vet_id"}))
public class SavedPost {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Post post;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "vet_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private VetProfile vet;

    private LocalDateTime savedAt;

    @PrePersist
    void onCreate() {
        savedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Post getPost() {
        return post;
    }

    public void setPost(Post post) {
        this.post = post;
    }

    public VetProfile getVet() {
        return vet;
    }

    public void setVet(VetProfile vet) {
        this.vet = vet;
    }

    public LocalDateTime getSavedAt() {
        return savedAt;
    }
}