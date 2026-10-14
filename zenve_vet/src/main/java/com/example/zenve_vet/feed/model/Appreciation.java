package com.example.zenve_vet.feed.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "appreciations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"post_id", "vet_id"}))
public class Appreciation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "post_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Post post;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vet_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private VetProfile vet;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Appreciation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Post getPost() { return post; }
    public void setPost(Post post) { this.post = post; }

    public VetProfile getVet() { return vet; }
    public void setVet(VetProfile vet) { this.vet = vet; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}