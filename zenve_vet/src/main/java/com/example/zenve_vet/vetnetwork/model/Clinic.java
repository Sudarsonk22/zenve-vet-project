package com.example.zenve_vet.vetnetwork.model;

import jakarta.persistence.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "clinics")
public class Clinic {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "vet_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private VetProfile vet;

    @Column(nullable = false)
    private String name;

    private String location;
    private String address;
    private String phone;
    private String openingHours;

    @Column(length = 1000)
    private String services;

    @Column(length = 2000)
    private String about;

    @Column(columnDefinition = "LONGTEXT")
    private String photoUrl;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Long getId() { return id; }
    public VetProfile getVet() { return vet; }
    public void setVet(VetProfile vet) { this.vet = vet; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }
    public String getServices() { return services; }
    public void setServices(String services) { this.services = services; }
    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
    public String getPhotoUrl() { return photoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}