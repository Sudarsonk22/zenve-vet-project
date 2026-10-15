package com.example.zenve_vet.search;

import com.example.zenve_vet.feed.dto.PostResponse;
import com.example.zenve_vet.vetnetwork.dto.VetResponse;

import java.util.List;

/**
 * One answer for the whole Search page.
 *
 * <p>The counts are for the <em>current filters</em> and are always all four, whichever
 * tab is open - the tab strip shows every number at once, so computing only the
 * active one would leave the others blank or, worse, stale from a previous query.
 */
public record SearchResponse(
        String query,
        Counts counts,
        List<VetResponse> doctors,
        List<PostResponse> posts,
        int page,
        int size,
        long totalElements,
        int totalPages
) {

    /** {@code all} is doctors + every post, so it matches the "All" tab exactly. */
    public record Counts(long all, long doctors, long cases, long storiesAndVideos, long posts) {
    }
}
