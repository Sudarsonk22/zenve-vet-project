package com.example.zenve_vet.shortvideo.repository;

import com.example.zenve_vet.shortvideo.model.VideoView;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface VideoViewRepository extends JpaRepository<VideoView, Long> {

    Optional<VideoView> findByVideo_IdAndVet_Id(Long videoId, Long vetId);

    Page<VideoView> findByVet_IdOrderByWatchedAtDesc(Long vetId, Pageable pageable);

    void deleteByVideo_Id(Long videoId);
}
