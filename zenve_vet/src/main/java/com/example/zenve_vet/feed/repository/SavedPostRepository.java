package com.example.zenve_vet.feed.repository;

import com.example.zenve_vet.feed.model.SavedPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SavedPostRepository extends JpaRepository<SavedPost, Long> {

    boolean existsByPost_IdAndVet_Id(Long postId, Long vetId);

    Optional<SavedPost> findByPost_IdAndVet_Id(Long postId, Long vetId);

    Page<SavedPost> findByVet_IdOrderBySavedAtDesc(Long vetId, Pageable pageable);
}