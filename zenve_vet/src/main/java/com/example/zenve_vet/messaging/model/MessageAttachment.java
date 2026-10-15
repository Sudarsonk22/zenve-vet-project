package com.example.zenve_vet.messaging.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

/**
 * A file uploaded for a message.
 *
 * <p>Created by the upload call before the message exists - the client uploads,
 * gets ids back, then sends the message quoting them - so {@code message} is null
 * until it is claimed. An attachment nobody claims is simply an orphan upload.
 */
@Entity
@Table(name = "message_attachments")
public class MessageAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "content_type", length = 120)
    private String contentType;

    @Column(name = "size_bytes", nullable = false)
    private long size;

    /** Path relative to the uploads root - never an absolute disk path in the API. */
    @Column(name = "storage_path", nullable = false)
    private String storagePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected MessageAttachment() {
    }

    public MessageAttachment(String fileName, String contentType, long size, String storagePath) {
        this.fileName = fileName;
        this.contentType = contentType;
        this.size = size;
        this.storagePath = storagePath;
    }

    public Long getId() { return id; }
    public Message getMessage() { return message; }
    public void setMessage(Message message) { this.message = message; }
    public String getFileName() { return fileName; }
    public String getContentType() { return contentType; }
    public long getSize() { return size; }
    public String getStoragePath() { return storagePath; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
