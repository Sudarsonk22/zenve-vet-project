package com.example.zenve_vet.advertise.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "advertisers")
public class Advertiser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String brandName;

    @Column(nullable = false, unique = true)
    private String email;

    private String website;

    @Column(nullable = false, unique = true)
    private String accessKeyHash;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public String getBrandName() { return brandName; }
    public void setBrandName(String brandName) { this.brandName = brandName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }
    public String getAccessKeyHash() { return accessKeyHash; }
    public void setAccessKeyHash(String accessKeyHash) { this.accessKeyHash = accessKeyHash; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}