package com.example.zenve_vet.shortvideo.repository;

import com.example.zenve_vet.shortvideo.model.VideoLike;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VideoLikeRepository extends JpaRepository<VideoLike, Long> {

    Optional<VideoLike> findByVideo_IdAndVet_Id(Long videoId, Long vetId);

    void deleteByVideo_Id(Long videoId);

    /**
     * Which of these videos the viewer has liked. One query for a whole page -
     * asking per row would be a query per card.
     */
    @Query("select l.video.id from VideoLike l where l.vet.id = :vetId and l.video.id in :videoIds")
    List<Long> findLikedVideoIds(@Param("vetId") Long vetId, @Param("videoIds") List<Long> videoIds);
}
