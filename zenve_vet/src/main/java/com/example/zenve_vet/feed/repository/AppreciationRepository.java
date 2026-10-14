package com.example.zenve_vet.feed.repository;

import com.example.zenve_vet.feed.model.Appreciation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppreciationRepository extends JpaRepository<Appreciation, Long> {

    boolean existsByPost_IdAndVet_Id(Long postId, Long vetId);

    Optional<Appreciation> findByPost_IdAndVet_Id(Long postId, Long vetId);

    long countByPost_Id(Long postId);
}