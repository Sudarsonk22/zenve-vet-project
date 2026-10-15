package com.example.zenve_vet.messaging.repository;

import com.example.zenve_vet.messaging.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, Long> {

    /** Newest first - page 0 is the bottom of the chat, which is what opens. */
    Page<Message> findByConversation_IdOrderByCreatedAtDesc(Long conversationId, Pageable pageable);

    Optional<Message> findTopByConversation_IdOrderByCreatedAtDesc(Long conversationId);

    /**
     * Unread for one participant: messages the other side sent after the point this
     * participant last read to. A null {@code since} means they have read nothing.
     */
    @Query("""
            select count(m) from Message m
            where m.conversation.id = :conversationId
              and m.sender.id <> :vetId
              and (:since is null or m.createdAt > :since)
            """)
    long countUnread(@Param("conversationId") Long conversationId,
                     @Param("vetId") Long vetId,
                     @Param("since") LocalDateTime since);

    @Query("""
            select m from Message m
            where m.conversation.id in :conversationIds
              and lower(coalesce(m.content, '')) like lower(concat('%', :q, '%'))
            """)
    List<Message> searchInConversations(@Param("conversationIds") List<Long> conversationIds,
                                        @Param("q") String q);
}
