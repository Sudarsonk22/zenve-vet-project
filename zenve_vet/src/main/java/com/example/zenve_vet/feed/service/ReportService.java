package com.example.zenve_vet.feed.service;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.common.exception.ConflictException;
import com.example.zenve_vet.common.exception.NotFoundException;
import com.example.zenve_vet.feed.dto.AuthorSummary;
import com.example.zenve_vet.feed.dto.ReportRequest;
import com.example.zenve_vet.feed.dto.ReportResponse;
import com.example.zenve_vet.feed.model.Post;
import com.example.zenve_vet.feed.model.PostReport;
import com.example.zenve_vet.feed.repository.PostRepository;
import com.example.zenve_vet.feed.repository.ReportRepository;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class ReportService {

    private final ReportRepository reportRepository;
    private final PostRepository postRepository;
    private final VetRepository vetRepository;

    public ReportService(ReportRepository reportRepository,
                         PostRepository postRepository,
                         VetRepository vetRepository) {
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.vetRepository = vetRepository;
    }

    public ReportResponse create(Long postId, ReportRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("Post not found"));
        VetProfile reporter = vetRepository.findById(request.reporterId())
                .orElseThrow(() -> new NotFoundException("Vet not found"));

        if (reportRepository.existsByPost_IdAndReporter_Id(postId, request.reporterId())) {
            throw new ConflictException("You already reported this post");
        }

        PostReport report = new PostReport();
        report.setPost(post);
        report.setReporter(reporter);
        report.setReason(request.reason());
        report.setDetails(request.details());

        return toResponse(reportRepository.save(report));
    }

    public PageResponse<ReportResponse> list(Boolean resolved, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Order.desc("createdAt")));

        Page<PostReport> result = resolved == null
                ? reportRepository.findAll(pageRequest)
                : reportRepository.findByResolved(resolved, pageRequest);

        return new PageResponse<>(
                result.getContent().stream().map(this::toResponse).toList(),
                result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    public ReportResponse resolve(Long id) {
        PostReport report = reportRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Report not found"));
        report.setResolved(true);
        return toResponse(reportRepository.save(report));
    }

    private ReportResponse toResponse(PostReport report) {
        VetProfile vet = report.getReporter();
        AuthorSummary reporter = new AuthorSummary(vet.getId(), vet.getSlug(), vet.getFullName(),
                vet.getSpecialty(), vet.getCity(), vet.getState(), vet.getAvatarUrl());

        return new ReportResponse(report.getId(), report.getPost().getId(), report.getPost().getBody(),
                report.getReason(), report.getDetails(), reporter,
                report.isResolved(), report.getCreatedAt());
    }
}