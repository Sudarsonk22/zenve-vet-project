package com.example.zenve_vet.messaging.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * A one-to-one thread between two vets.
 *
 * <p>The pair is stored in a fixed order - {@code vetLow} always holds the smaller
 * id - and carries a unique constraint. That is what makes "open a chat with this
 * person" idempotent: without the ordering, A to B and B to A would be two separate
 * rows, and the same two people could end up with two threads.
 */
@Entity
@Table(
        name = "conversations",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_conversation_pair",
                columnNames = {"vet_low_id", "vet_high_id"})
)
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_low_id")
    private VetProfile vetLow;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_high_id")
    private VetProfile vetHigh;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Denormalised so the conversation list can sort without touching messages. */
    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    protected Conversation() {
    }

    public Conversation(VetProfile a, VetProfile b) {
        boolean aFirst = a.getId() < b.getId();
        this.vetLow = aFirst ? a : b;
        this.vetHigh = aFirst ? b : a;
        this.lastMessageAt = this.createdAt;
    }

    /** The other side of the thread, from one participant point of view. */
    public VetProfile otherThan(Long vetId) {
        return vetLow.getId().equals(vetId) ? vetHigh : vetLow;
    }

    public boolean includes(Long vetId) {
        return vetLow.getId().equals(vetId) || vetHigh.getId().equals(vetId);
    }

    public Long getId() { return id; }
    public VetProfile getVetLow() { return vetLow; }
    public VetProfile getVetHigh() { return vetHigh; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getLastMessageAt() { return lastMessageAt; }
    public void setLastMessageAt(LocalDateTime lastMessageAt) { this.lastMessageAt = lastMessageAt; }
}
