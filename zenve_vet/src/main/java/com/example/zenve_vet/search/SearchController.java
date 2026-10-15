package com.example.zenve_vet.search;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** The Search page - people, cases and posts behind one query. */
@RestController
@RequestMapping("/api/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    /**
     * @param tab one of {@code all}, {@code doctors}, {@code cases}, {@code stories-videos}.
     *            The counts in the response always cover all four, so the tab strip can
     *            show every number regardless of which one is open.
     */
    @GetMapping
    public SearchResponse search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String state,
            @RequestParam(defaultValue = "false") boolean verifiedOnly,
            @RequestParam(defaultValue = "false") boolean hasTakeaways,
            @RequestParam(defaultValue = "all") String tab,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size
    ) {
        return searchService.search(q, topic, state, verifiedOnly, hasTakeaways, tab, viewerId, page, size);
    }

    /** The chip row above the results. */
    @GetMapping("/topics")
    public List<String> topics() {
        return searchService.topics();
    }
}
