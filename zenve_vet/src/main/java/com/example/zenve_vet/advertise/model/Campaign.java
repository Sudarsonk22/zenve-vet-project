package com.example.zenve_vet.advertise.model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "campaigns")
public class Campaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "advertiser_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Advertiser advertiser;

    @Column(nullable = false)
    private String headline;

    private String buttonText;

    @Column(nullable = false, length = 1000)
    private String destinationUrl;

    @Column(columnDefinition = "LONGTEXT")
    private String posterUrl;

    private LocalDateTime startsAt;
    private LocalDateTime endsAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CampaignStatus status = CampaignStatus.PENDING;

    private String reviewNote;

    private long views;
    private long clicks;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public Advertiser getAdvertiser() { return advertiser; }
    public void setAdvertiser(Advertiser advertiser) { this.advertiser = advertiser; }
    public String getHeadline() { return headline; }
    public void setHeadline(String headline) { this.headline = headline; }
    public String getButtonText() { return buttonText; }
    public void setButtonText(String buttonText) { this.buttonText = buttonText; }
    public String getDestinationUrl() { return destinationUrl; }
    public void setDestinationUrl(String destinationUrl) { this.destinationUrl = destinationUrl; }
    public String getPosterUrl() { return posterUrl; }
    public void setPosterUrl(String posterUrl) { this.posterUrl = posterUrl; }
    public LocalDateTime getStartsAt() { return startsAt; }
    public void setStartsAt(LocalDateTime startsAt) { this.startsAt = startsAt; }
    public LocalDateTime getEndsAt() { return endsAt; }
    public void setEndsAt(LocalDateTime endsAt) { this.endsAt = endsAt; }
    public CampaignStatus getStatus() { return status; }
    public void setStatus(CampaignStatus status) { this.status = status; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public long getViews() { return views; }
    public long getClicks() { return clicks; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}