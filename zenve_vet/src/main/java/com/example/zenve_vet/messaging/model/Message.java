package com.example.zenve_vet.messaging.model;

import com.example.zenve_vet.vetnetwork.model.VetProfile;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** One message in a thread. */
@Entity
@Table(
        name = "messages",
        indexes = @Index(name = "idx_message_conversation", columnList = "conversation_id, created_at")
)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id")
    private VetProfile sender;

    /** Optional: a message may carry attachments and no words. */
    @Column(length = 4000)
    private String content;

    /** Self-reference for replies; null when the message is not a reply. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reply_to_id")
    private Message replyTo;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "message", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MessageReaction> reactions = new ArrayList<>();

    @OneToMany(mappedBy = "message")
    private List<MessageAttachment> attachments = new ArrayList<>();

    protected Message() {
    }

    public Message(Conversation conversation, VetProfile sender, String content) {
        this.conversation = conversation;
        this.sender = sender;
        this.content = content;
    }

    public Long getId() { return id; }
    public Conversation getConversation() { return conversation; }
    public VetProfile getSender() { return sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Message getReplyTo() { return replyTo; }
    public void setReplyTo(Message replyTo) { this.replyTo = replyTo; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public List<MessageReaction> getReactions() { return reactions; }
    public List<MessageAttachment> getAttachments() { return attachments; }
}
