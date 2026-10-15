package com.example.zenve_vet.shortvideo.repository;

import com.example.zenve_vet.shortvideo.model.VideoComment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VideoCommentRepository extends JpaRepository<VideoComment, Long> {

    Page<VideoComment> findByVideo_IdOrderByCreatedAtDesc(Long videoId, Pageable pageable);

    long countByVideo_Id(Long videoId);

    void deleteByVideo_Id(Long videoId);
}
