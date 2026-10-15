package com.example.zenve_vet.messaging.controller;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.messaging.dto.*;
import com.example.zenve_vet.messaging.service.MessagingService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Direct messages.
 *
 * <p>Paths follow the frontend contract in {@code BACKEND_API_CONTRACT.md}. That
 * document assumes the caller is identified by a JWT; this application has no
 * login, so the caller passes {@code viewerId}, the same convention the feed and
 * the vet network already use. See {@link MessagingService} on what that does and
 * does not guarantee.
 */
@RestController
@RequestMapping("/api")
public class MessagingController {

    private final MessagingService messagingService;

    public MessagingController(MessagingService messagingService) {
        this.messagingService = messagingService;
    }

    /** Who the caller is, as the backend sees them. */
    @GetMapping("/auth/me")
    public UserSummary me(@RequestParam(required = false) Long viewerId) {
        return messagingService.me(viewerId);
    }

    /** The contact panel beside an open thread. */
    @GetMapping("/users/{id}")
    public UserSummary profile(@PathVariable Long id,
                               @RequestParam(required = false) Long viewerId) {
        return messagingService.profile(id, viewerId);
    }

    @GetMapping("/conversations")
    public List<ConversationResponse> conversations(
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(required = false) String q
    ) {
        return messagingService.conversations(viewerId, filter, q);
    }

    @PostMapping("/conversations")
    public ConversationResponse start(
            @RequestParam(required = false) Long viewerId,
            @Valid @RequestBody StartConversationRequest request
    ) {
        return messagingService.startConversation(viewerId, request.participantId());
    }

    /** Page 0 is the newest messages - the chat opens at the bottom. */
    @GetMapping("/conversations/{id}/messages")
    public PageResponse<MessageResponse> messages(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "30") int size
    ) {
        return messagingService.messages(viewerId, id, page, size);
    }

    @PostMapping("/conversations/{id}/messages")
    public MessageResponse send(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId,
            @Valid @RequestBody SendMessageRequest request
    ) {
        return messagingService.send(viewerId, id, request);
    }

    @PostMapping("/conversations/{id}/read")
    public void markRead(@PathVariable Long id,
                         @RequestParam(required = false) Long viewerId) {
        messagingService.markRead(viewerId, id);
    }

    @PutMapping("/conversations/{id}/pin")
    public void pin(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        messagingService.setPinned(viewerId, id, true);
    }

    @DeleteMapping("/conversations/{id}/pin")
    public void unpin(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        messagingService.setPinned(viewerId, id, false);
    }

    @PutMapping("/conversations/{id}/archive")
    public void archive(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        messagingService.setArchived(viewerId, id, true);
    }

    @DeleteMapping("/conversations/{id}/archive")
    public void unarchive(@PathVariable Long id, @RequestParam(required = false) Long viewerId) {
        messagingService.setArchived(viewerId, id, false);
    }

    @PostMapping("/messages/{id}/reactions")
    public MessageResponse addReaction(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId,
            @Valid @RequestBody ReactionRequest request
    ) {
        return messagingService.addReaction(viewerId, id, request.emoji());
    }

    @DeleteMapping("/messages/{id}/reactions")
    public MessageResponse removeReaction(
            @PathVariable Long id,
            @RequestParam(required = false) Long viewerId,
            @RequestParam String emoji
    ) {
        return messagingService.removeReaction(viewerId, id, emoji);
    }
}
