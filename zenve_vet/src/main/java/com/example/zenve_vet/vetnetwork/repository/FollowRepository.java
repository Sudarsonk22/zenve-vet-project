package com.example.zenve_vet.vetnetwork.repository;

import com.example.zenve_vet.vetnetwork.model.Follow;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow, Long> {

    boolean existsByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    Optional<Follow> findByFollower_IdAndFollowing_Id(Long followerId, Long followingId);

    long countByFollowing_Id(Long vetId);

    long countByFollower_Id(Long vetId);

    List<Follow> findByFollowing_Id(Long vetId);

    List<Follow> findByFollower_Id(Long vetId);

    void deleteByFollower_IdOrFollowing_Id(Long followerId, Long followingId);
}