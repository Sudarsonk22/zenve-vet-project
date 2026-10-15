package com.example.zenve_vet.advertise.repository;

import com.example.zenve_vet.advertise.model.Advertiser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdvertiserRepository extends JpaRepository<Advertiser, Long> {

    boolean existsByEmailIgnoreCase(String email);

    Optional<Advertiser> findByAccessKeyHash(String accessKeyHash);
}