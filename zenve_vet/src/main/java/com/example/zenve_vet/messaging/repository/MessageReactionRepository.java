package com.example.zenve_vet.messaging.repository;

import com.example.zenve_vet.messaging.model.MessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long> {

    Optional<MessageReaction> findByMessage_IdAndVet_IdAndEmoji(Long messageId, Long vetId, String emoji);

    List<MessageReaction> findByMessage_Id(Long messageId);
}
