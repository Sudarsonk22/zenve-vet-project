package com.example.zenve_vet.feed.repository;

import com.example.zenve_vet.feed.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    long countByPost_Id(Long postId);

    List<Comment> findByPost_IdOrderByCreatedAtAsc(Long postId);
}