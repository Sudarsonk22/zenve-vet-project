package com.example.zenve_vet.messaging.service;

import com.example.zenve_vet.common.PageResponse;
import com.example.zenve_vet.common.exception.BadRequestException;
import com.example.zenve_vet.common.exception.NotFoundException;
import com.example.zenve_vet.messaging.dto.*;
import com.example.zenve_vet.messaging.model.*;
import com.example.zenve_vet.messaging.repository.*;
import com.example.zenve_vet.vetnetwork.model.VetProfile;
import com.example.zenve_vet.vetnetwork.repository.VetRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/**
 * Direct messages between vets.
 *
 * <p><b>On identity.</b> This application has no login - the create-profile dialog
 * says so in as many words - so "who am I" arrives as a vet id from the client,
 * the same convention {@code viewerId} already follows across this backend. That
 * means participation is <em>asserted</em>, not proven: it keeps one person out of
 * another thread by accident, but it is not a security boundary. Anyone who can
 * call the API can claim any id. Real enforcement needs real authentication, at
 * which point {@link #requireParticipant} becomes the place that gets teeth.
 */
@Service
public class MessagingService {

    private static final int MAX_PAGE_SIZE = 50;

    private final ConversationRepository conversationRepository;
    private final ConversationStateRepository stateRepository;
    private final MessageRepository messageRepository;
    private final MessageAttachmentRepository attachmentRepository;
    private final MessageReactionRepository reactionRepository;
    private final VetRepository vetRepository;

    public MessagingService(
            ConversationRepository conversationRepository,
            ConversationStateRepository stateRepository,
            MessageRepository messageRepository,
            MessageAttachmentRepository attachmentRepository,
            MessageReactionRepository reactionRepository,
            VetRepository vetRepository
    ) {
        this.conversationRepository = conversationRepository;
        this.stateRepository = stateRepository;
        this.messageRepository = messageRepository;
        this.attachmentRepository = attachmentRepository;
        this.reactionRepository = reactionRepository;
        this.vetRepository = vetRepository;
    }

    // --------------------------------------------------------------- identity

    @Transactional(readOnly = true)
    public UserSummary me(Long viewerId) {
        return toUser(requireVet(viewerId), viewerId);
    }

    @Transactional(readOnly = true)
    public UserSummary profile(Long vetId, Long viewerId) {
        return toUser(requireVet(vetId), viewerId);
    }

    // ---------------------------------------------------------- conversations

    @Transactional(readOnly = true)
    public List<ConversationResponse> conversations(Long viewerId, String filter, String q) {
        requireVet(viewerId);

        List<Conversation> all = conversationRepository.findForVet(viewerId);
        String wanted = filter == null || filter.isBlank() ? "all" : filter.trim().toLowerCase();
        String needle = q == null ? "" : q.trim().toLowerCase();

        // A search has to look inside the thread, not just at the preview line -
        // the message somebody remembers is rarely the most recent one. One query
        // collects every thread containing the term, rather than one query per row.
        Set<Long> textMatches = Set.of();
        if (!needle.isEmpty()) {
            List<Long> ids = all.stream().map(Conversation::getId).toList();
            textMatches = ids.isEmpty()
                    ? Set.of()
                    : messageRepository.searchInConversations(ids, needle).stream()
                            .map(message -> message.getConversation().getId())
                            .collect(java.util.stream.Collectors.toSet());
        }

        List<ConversationResponse> rows = new ArrayList<>();
        for (Conversation conversation : all) {
            ConversationState state = stateFor(conversation, viewerId);
            ConversationResponse row = toConversation(conversation, state, viewerId);

            if (!matchesFilter(row, wanted)) {
                continue;
            }
            if (!needle.isEmpty()
                    && !matchesQuery(row, needle)
                    && !textMatches.contains(conversation.getId())) {
                continue;
            }
            rows.add(row);
        }

        // Pinned first, then most recent. Sorting here rather than in SQL because
        // "pinned" lives on the per-participant state, not on the conversation.
        rows.sort(Comparator
                .comparing(ConversationResponse::pinned).reversed()
                .thenComparing(ConversationResponse::lastMessageAt,
                        Comparator.nullsLast(Comparator.reverseOrder())));
        return rows;
    }

    /** Get-or-create. Opening a chat twice must land in the same thread. */
    @Transactional
    public ConversationResponse startConversation(Long viewerId, Long participantId) {
        VetProfile me = requireVet(viewerId);
        VetProfile other = requireVet(participantId);

        if (Objects.equals(me.getId(), other.getId())) {
            throw new BadRequestException("You cannot start a conversation with yourself.");
        }

        long low = Math.min(me.getId(), other.getId());
        long high = Math.max(me.getId(), other.getId());

        Conversation conversation = conversationRepository.findByPair(low, high)
                .orElseGet(() -> conversationRepository.save(new Conversation(me, other)));

        return toConversation(conversation, stateFor(conversation, viewerId), viewerId);
    }

    // --------------------------------------------------------------- messages

    /**
     * Page 0 is the newest messages, as the contract requires - a chat opens at the
     * bottom, and "load older" walks forward through the pages.
     */
    @Transactional(readOnly = true)
    public PageResponse<MessageResponse> messages(Long viewerId, Long conversationId, int page, int size) {
        Conversation conversation = requireParticipant(conversationId, viewerId);

        if (page < 0) {
            throw new BadRequestException("Page cannot be negative");
        }
        int safeSize = size < 1 ? 30 : Math.min(size, MAX_PAGE_SIZE);

        Page<Message> result = messageRepository.findByConversation_IdOrderByCreatedAtDesc(
                conversation.getId(), PageRequest.of(page, safeSize));

        List<MessageResponse> items = result.getContent().stream()
                .map(message -> toMessage(message, viewerId))
                .toList();

        return new PageResponse<>(items, result.getNumber(), result.getSize(),
                result.getTotalElements(), result.getTotalPages());
    }

    @Transactional
    public MessageResponse send(Long viewerId, Long conversationId, SendMessageRequest request) {
        Conversation conversation = requireParticipant(conversationId, viewerId);
        VetProfile sender = requireVet(viewerId);

        String content = request.content() == null ? "" : request.content().trim();
        List<Long> attachmentIds = request.attachmentIds() == null ? List.of() : request.attachmentIds();

        if (content.isEmpty() && attachmentIds.isEmpty()) {
            throw new BadRequestException("A message needs either text or an attachment.");
        }

        Message message = new Message(conversation, sender, content.isEmpty() ? null : content);

        if (request.replyToId() != null) {
            Message replyTo = messageRepository.findById(request.replyToId())
                    .orElseThrow(() -> new NotFoundException("Message not found: " + request.replyToId()));
            // A reply must point inside the same thread, or quoting it would leak
            // text from a conversation the reader is not part of.
            if (!replyTo.getConversation().getId().equals(conversation.getId())) {
                throw new BadRequestException("You can only reply to a message in the same conversation.");
            }
            message.setReplyTo(replyTo);
        }

        Message saved = messageRepository.save(message);

        for (Long attachmentId : attachmentIds) {
            MessageAttachment attachment = attachmentRepository.findById(attachmentId)
                    .orElseThrow(() -> new NotFoundException("Attachment not found: " + attachmentId));
            if (attachment.getMessage() != null) {
                throw new BadRequestException("That attachment is already attached to another message.");
            }
            attachment.setMessage(saved);
            attachmentRepository.save(attachment);
        }

        conversation.setLastMessageAt(saved.getCreatedAt());
        conversationRepository.save(conversation);

        // The sender has, by definition, read their own message.
        ConversationState mine = stateFor(conversation, viewerId);
        mine.setLastReadAt(saved.getCreatedAt());
        stateRepository.save(mine);

        return toMessage(saved, viewerId);
    }

    @Transactional
    public void markRead(Long viewerId, Long conversationId) {
        Conversation conversation = requireParticipant(conversationId, viewerId);
        ConversationState state = stateFor(conversation, viewerId);
        state.setLastReadAt(LocalDateTime.now());
        stateRepository.save(state);
    }

    @Transactional
    public void setPinned(Long viewerId, Long conversationId, boolean pinned) {
        Conversation conversation = requireParticipant(conversationId, viewerId);
        ConversationState state = stateFor(conversation, viewerId);
        state.setPinned(pinned);
        stateRepository.save(state);
    }

    @Transactional
    public void setArchived(Long viewerId, Long conversationId, boolean archived) {
        Conversation conversation = requireParticipant(conversationId, viewerId);
        ConversationState state = stateFor(conversation, viewerId);
        state.setArchived(archived);
        stateRepository.save(state);
    }

    // -------------------------------------------------------------- reactions

    @Transactional
    public MessageResponse addReaction(Long viewerId, Long messageId, String emoji) {
        Message message = requireReadableMessage(messageId, viewerId);
        VetProfile vet = requireVet(viewerId);

        // Idempotent: reacting twice with the same emoji is a no-op, not a duplicate.
        reactionRepository.findByMessage_IdAndVet_IdAndEmoji(messageId, viewerId, emoji)
                .orElseGet(() -> reactionRepository.save(new MessageReaction(message, vet, emoji)));

        return toMessage(message, viewerId);
    }

    @Transactional
    public MessageResponse removeReaction(Long viewerId, Long messageId, String emoji) {
        Message message = requireReadableMessage(messageId, viewerId);
        reactionRepository.findByMessage_IdAndVet_IdAndEmoji(messageId, viewerId, emoji)
                .ifPresent(reactionRepository::delete);
        return toMessage(message, viewerId);
    }

    // ------------------------------------------------------------ attachments

    @Transactional
    public MessageAttachment saveAttachment(MessageAttachment attachment) {
        return attachmentRepository.save(attachment);
    }

    @Transactional(readOnly = true)
    public MessageAttachment attachment(Long id) {
        return attachmentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Attachment not found: " + id));
    }

    // ------------------------------------------------------------- guard rails

    private VetProfile requireVet(Long id) {
        if (id == null) {
            throw new BadRequestException("A viewer id is required for messaging.");
        }
        return vetRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Vet not found: " + id));
    }

    /**
     * The one place that decides whether a caller may see a thread. With no
     * authentication the id is only asserted - see the note on this class - but
     * routing every read and write through here means there is a single line to
     * harden once a real principal exists.
     */
    private Conversation requireParticipant(Long conversationId, Long viewerId) {
        if (viewerId == null) {
            throw new BadRequestException("A viewer id is required for messaging.");
        }
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new NotFoundException("Conversation not found: " + conversationId));

        if (!conversation.includes(viewerId)) {
            throw new NotFoundException("Conversation not found: " + conversationId);
        }
        return conversation;
    }

    private Message requireReadableMessage(Long messageId, Long viewerId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new NotFoundException("Message not found: " + messageId));
        requireParticipant(message.getConversation().getId(), viewerId);
        return message;
    }

    /** Per-participant state is created on first touch rather than up front. */
    private ConversationState stateFor(Conversation conversation, Long vetId) {
        return stateRepository.findByConversation_IdAndVet_Id(conversation.getId(), vetId)
                .orElseGet(() -> stateRepository.save(
                        new ConversationState(conversation, requireVet(vetId))));
    }

    private boolean matchesFilter(ConversationResponse row, String filter) {
        return switch (filter) {
            case "unread" -> row.unreadCount() > 0 && !row.archived();
            case "pinned" -> row.pinned() && !row.archived();
            case "archived" -> row.archived();
            // An archived thread is out of the way, so it stays out of "all".
            default -> !row.archived();
        };
    }

    /** Name match only - message bodies are handled by the batch query in {@link #conversations}. */
    private boolean matchesQuery(ConversationResponse row, String needle) {
        String name = row.participant() == null ? "" : String.valueOf(row.participant().name());
        return name.toLowerCase().contains(needle);
    }

    // ------------------------------------------------------------- projection

    private ConversationResponse toConversation(Conversation conversation, ConversationState state, Long viewerId) {
        VetProfile other = conversation.otherThan(viewerId);

        ConversationResponse.LastMessage last = messageRepository
                .findTopByConversation_IdOrderByCreatedAtDesc(conversation.getId())
                .map(message -> new ConversationResponse.LastMessage(
                        preview(message),
                        message.getCreatedAt(),
                        message.getSender().getId().equals(viewerId)))
                .orElse(null);

        long unread = messageRepository.countUnread(
                conversation.getId(), viewerId, state.getLastReadAt());

        return new ConversationResponse(
                conversation.getId(),
                toUser(other, viewerId),
                last,
                last == null ? conversation.getCreatedAt() : last.createdAt(),
                unread,
                state.isPinned(),
                state.isArchived()
        );
    }

    /** An attachment-only message still needs something to show in the list. */
    private String preview(Message message) {
        if (message.getContent() != null && !message.getContent().isBlank()) {
            return message.getContent();
        }
        int count = attachmentRepository.findByMessage_Id(message.getId()).size();
        return count == 1 ? "Attachment" : count + " attachments";
    }

    private MessageResponse toMessage(Message message, Long viewerId) {
        List<AttachmentResponse> attachments = attachmentRepository
                .findByMessage_Id(message.getId()).stream()
                .map(this::toAttachment)
                .toList();

        // Group identical emoji into one chip, and note whether the viewer is in it.
        Map<String, long[]> tally = new LinkedHashMap<>();
        Set<String> mine = new HashSet<>();
        for (MessageReaction reaction : reactionRepository.findByMessage_Id(message.getId())) {
            tally.computeIfAbsent(reaction.getEmoji(), key -> new long[1])[0]++;
            if (reaction.getVet().getId().equals(viewerId)) {
                mine.add(reaction.getEmoji());
            }
        }
        List<ReactionResponse> reactions = tally.entrySet().stream()
                .map(e -> new ReactionResponse(e.getKey(), e.getValue()[0], mine.contains(e.getKey())))
                .toList();

        Message replyTo = message.getReplyTo();
        ReplyPreview reply = replyTo == null ? null : new ReplyPreview(
                replyTo.getId(), replyTo.getContent(), replyTo.getSender().getFullName());

        boolean isMine = message.getSender().getId().equals(viewerId);

        return new MessageResponse(
                message.getId(),
                message.getConversation().getId(),
                message.getContent(),
                message.getCreatedAt(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                isMine,
                statusFor(message, isMine),
                attachments,
                reply,
                reactions
        );
    }

    /**
     * Only outgoing messages carry a tick. READ means the other side has read past
     * this message; anything else is SENT. There is no delivery channel to report
     * DELIVERED honestly, so it is never claimed.
     */
    private String statusFor(Message message, boolean mine) {
        if (!mine) {
            return null;
        }
        Long otherId = message.getConversation().otherThan(message.getSender().getId()).getId();
        return stateRepository.findByConversation_IdAndVet_Id(message.getConversation().getId(), otherId)
                .map(ConversationState::getLastReadAt)
                .filter(readAt -> !readAt.isBefore(message.getCreatedAt()))
                .map(readAt -> "READ")
                .orElse("SENT");
    }

    private AttachmentResponse toAttachment(MessageAttachment attachment) {
        return new AttachmentResponse(
                attachment.getId(),
                "/api/messages/attachments/" + attachment.getId(),
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getSize()
        );
    }

    private UserSummary toUser(VetProfile vet, Long viewerId) {
        String location = vet.getState() == null || vet.getState().isBlank()
                ? vet.getCity()
                : vet.getCity() + ", " + vet.getState();

        return new UserSummary(
                vet.getId(),
                vet.getFullName(),
                vet.getAvatarUrl(),
                vet.getSpecialty(),
                location,
                vet.getBio(),
                false,
                vet.getId().equals(viewerId)
        );
    }
}
