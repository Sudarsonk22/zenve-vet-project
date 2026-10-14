package com.example.zenve_vet.feed.repository;

import com.example.zenve_vet.feed.model.PostReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReportRepository extends JpaRepository<PostReport, Long> {

    boolean existsByPost_IdAndReporter_Id(Long postId, Long reporterId);

    Page<PostReport> findByResolved(boolean resolved, Pageable pageable);
}