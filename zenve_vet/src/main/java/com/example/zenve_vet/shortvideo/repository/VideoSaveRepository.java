package com.example.zenve_vet.shortvideo.repository;

import com.example.zenve_vet.shortvideo.model.VideoSave;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VideoSaveRepository extends JpaRepository<VideoSave, Long> {

    Optional<VideoSave> findByVideo_IdAndVet_Id(Long videoId, Long vetId);

    void deleteByVideo_Id(Long videoId);

    Page<VideoSave> findByVet_IdOrderBySavedAtDesc(Long vetId, Pageable pageable);

    @Query("select s.video.id from VideoSave s where s.vet.id = :vetId and s.video.id in :videoIds")
    List<Long> findSavedVideoIds(@Param("vetId") Long vetId, @Param("videoIds") List<Long> videoIds);
}
