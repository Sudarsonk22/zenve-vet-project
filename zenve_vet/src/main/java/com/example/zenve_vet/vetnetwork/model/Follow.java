package com.example.zenve_vet.vetnetwork.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "follows",
        uniqueConstraints = @UniqueConstraint(columnNames = {"follower_id", "following_id"}))
public class Follow {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "follower_id")
    private VetProfile follower;

    @ManyToOne(optional = false)
    @JoinColumn(name = "following_id")
    private VetProfile following;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Follow() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public VetProfile getFollower() { return follower; }
    public void setFollower(VetProfile follower) { this.follower = follower; }

    public VetProfile getFollowing() { return following; }
    public void setFollowing(VetProfile following) { this.following = following; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}