package com.example.zenve_vet.messaging.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * One emoji from one vet on one message.
 *
 * <p>The unique constraint is what makes reacting idempotent - tapping the same
 * emoji twice cannot produce two rows, so the count stays honest.
 */
@Entity
@Table(
        name = "message_reactions",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_message_reaction",
                columnNames = {"message_id", "vet_id", "emoji"})
)
public class MessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "message_id")
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    private VetProfile vet;

    @Column(nullable = false, length = 16)
    private String emoji;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected MessageReaction() {
    }

    public MessageReaction(Message message, VetProfile vet, String emoji) {
        this.message = message;
        this.vet = vet;
        this.emoji = emoji;
    }

    public Long getId() { return id; }
    public Message getMessage() { return message; }
    public VetProfile getVet() { return vet; }
    public String getEmoji() { return emoji; }
}
