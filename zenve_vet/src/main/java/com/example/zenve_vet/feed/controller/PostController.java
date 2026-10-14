package com.example.zenve_vet.feed.controller;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.feed.dto.*;
import com.example.zenve_vet.feed.model.PostType;
import com.example.zenve_vet.feed.service.PostService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping
    public PageResponse<PostResponse> list(@RequestParam(defaultValue = "for-you") String tab,
                                           @RequestParam(defaultValue = "") String specialty,
                                           @RequestParam(defaultValue = "") String state,
                                           @RequestParam(defaultValue = "") String city,
                                           @RequestParam(required = false) PostType type,
                                           @RequestParam(required = false) Long authorId,
                                           @RequestParam(required = false) Long viewerId,
                                           @RequestParam(defaultValue = "0") int page,
                                           @RequestParam(defaultValue = "10") int size) {
        return postService.list(tab, specialty, state, city, type, authorId, viewerId, page, size);
    }

    @GetMapping("/stories")
    public List<StoryResponse> stories() {
        return postService.stories();
    }

    @GetMapping("/saved")
    public PageResponse<PostResponse> saved(@RequestParam Long vetId,
                                            @RequestParam(defaultValue = "0") int page,
                                            @RequestParam(defaultValue = "10") int size) {
        return postService.savedPosts(vetId, page, size);
    }

    @GetMapping("/{id}")
    public PostResponse get(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        return postService.get(id, viewerId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse create(@Valid @RequestBody PostRequest request) {
        return postService.create(request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        postService.delete(id);
    }

    @PostMapping("/{id}/view")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void view(@PathVariable Long id) {
        postService.addView(id);
    }

    @PostMapping("/{id}/appreciate")
    public ReactionResponse appreciate(@PathVariable Long id, @Valid @RequestBody ReactRequest request) {
        return postService.appreciate(id, request.vetId());
    }

    @DeleteMapping("/{id}/appreciate")
    public ReactionResponse unappreciate(@PathVariable Long id, @RequestParam Long vetId) {
        return postService.removeAppreciation(id, vetId);
    }

    @PostMapping("/{id}/save")
    public SaveResponse save(@PathVariable Long id, @Valid @RequestBody ReactRequest request) {
        return postService.save(id, request.vetId());
    }

    @DeleteMapping("/{id}/save")
    public SaveResponse unsave(@PathVariable Long id, @RequestParam Long vetId) {
        return postService.unsave(id, vetId);
    }

    @GetMapping("/{id}/comments")
    public List<CommentResponse> comments(@PathVariable Long id) {
        return postService.comments(id);
    }

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse addComment(@PathVariable Long id, @Valid @RequestBody CommentRequest request) {
        return postService.addComment(id, request);
    }

    @PostMapping("/{id}/share")
    public ShareResponse share(@PathVariable Long id) {
        return postService.share(id);
    }
}