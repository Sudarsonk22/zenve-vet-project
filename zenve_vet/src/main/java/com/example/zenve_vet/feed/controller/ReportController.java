package com.example.zenve_vet.feed.controller;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.feed.dto.ReportRequest;
import com.example.zenve_vet.feed.dto.ReportResponse;
import com.example.zenve_vet.feed.service.ReportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/posts/{id}/report")
    @ResponseStatus(HttpStatus.CREATED)
    public ReportResponse report(@PathVariable Long id, @Valid @RequestBody ReportRequest request) {
        return reportService.create(id, request);
    }

    @GetMapping("/reports")
    public PageResponse<ReportResponse> list(@RequestParam(required = false) Boolean resolved,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "10") int size) {
        return reportService.list(resolved, page, size);
    }

    @PutMapping("/reports/{id}/resolve")
    public ReportResponse resolve(@PathVariable Long id) {
        return reportService.resolve(id);
    }
}