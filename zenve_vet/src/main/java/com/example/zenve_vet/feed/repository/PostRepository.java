package com.example.zenve_vet.feed.repository;

import com.example.zenve_vet.feed.model.Post;
import com.example.zenve_vet.feed.model.PostType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long>, JpaSpecificationExecutor<Post> {

    List<Post> findByTypeAndCreatedAtAfterOrderByCreatedAtDesc(PostType type, LocalDateTime since);
}